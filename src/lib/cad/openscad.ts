import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { logger } from '@/lib/utils/logger'



const execAsync = promisify(exec)

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? '/tmp/forge3d'

//Ensure output dir exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

export type OutputFormat = 'st1' | 'obj'

export interface RenderResult {
    outputPath: string
    outputUrl:  string
    format:     OutputFormat
}

export async function renderOpenSCAD(
  code:      string,
  jobId:     string,
  format:    OutputFormat = 'st1'
): Promise<RenderResult> {

    const scadPath = path.join(OUTPUT_DIR, `${jobId}.scad`)
    const outputPath = path.join(OUTPUT_DIR, `${jobId}.${format}`)
    const outputUrl = `/outputs/${jobId}.${format}`


    //write openSCAD code to file
    fs.writeFileSync(scadPath, code, 'utf-8')

    const openscadBin = process.env.OPENSCAD_PATH ?? 'openscad'

    try {  
        const { stderr } = await execAsync(
            `${openscadBin} -o ${outputPath} ${scadPath}`,
            {timeout: 60_00 }  // 60 seconds  timeout 

        )

        if (stderr && stderr.includes('ERROR')) {
            throw new Error(`OPENSCAD render error: ${stderr}`)
        }

        //cleans up the scad source file
        fs.unlinkSync(scadPath)

        logger.info('OpenSCAD render complete', { jobId, outputPath, format })

        return { outputPath, outputUrl, format }

    }  catch ( err) {
        // clean up on failure 
        if (fs.existsSync(scadPath))  fs.unlinkSync(scadPath)
        if (fs.existsSync(outputPath))  fs.unlinkSync(outputPath)
       
        logger.error('OpenSCAD render failed', { jobId, error: String(err) })
        throw err
    }
}