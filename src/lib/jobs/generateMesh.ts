import { jobStore } from "../redis/jobStore";
import { cache, hashPrompt } from '@/lib/redis/cache'
import { generateOpenSCADCode  } from '@/lib/ai/llmService';
import { renderOpenSCAD } from '@/lib/cad/openscad'
import { prisma } from '@/lib/prisma/client'
import { logger } from '@/lib/utils/logger'
import type { Dimensions } from '@/types'


export interface GenerateMeshInput {
    jobId: string
    userId: string
    prompt: string
    style: string
    resolution: string
    dimensions?: Dimensions

}

export async function generateMesh(input: GenerateMeshInput): Promise<void> {
    const { jobId, userId, prompt, style, dimensions } = input

    try {
        // Generating code 
        await jobStore.update(jobId, {
            status: 'in_progress',
            progress: 10,
            stage: 'Generating OpenSCAD code',
        })

        await prisma.generation.update({
            where: { id: jobId },
            data: { status: 'in_progress', startedAt: new Date() },
        })

        const { code } = await generateOpenSCADCode({
            prompt,
            style,
            dimensions,
            userId,
            generationId: jobId,
        })

        // Validating code 
        await jobStore.update(jobId, {
            progress: 40,
            stage:    'Validating CAD code'
        })

        await prisma.generation.update({
            where: { id: jobId },
            data: { openscadCode: code},
        })

        //Rendering 
        await jobStore.update(jobId, {
            progress: 60,
            stage: 'Rendering mesh',
        })

        const { outputUrl } = await renderOpenSCAD(code, jobId, 'st1')

        //Saving
        await jobStore.update(jobId, {
            progress: 90,
            stage:  'Saving output',
        })


        // Cache the result 
        const cacheKey = hashPrompt(prompt, style)
        await cache.set(cacheKey, JSON.stringify({ outputUrl, code}))

        // Done
        await jobStore.update(jobId, {
            status: 'succeeded',
            progress: 100,
            stage: 'Complete',
            modelUrl: outputUrl,
        })

        await prisma.generation.update({
            where: { id: jobId },
            data: {
                status:   'succeeded',
                progress:  100,
                outputUrl,
                outputFormat: 'st1',
                completedAt: new Date(),
            },
        })

        await prisma.usageLog.create({
            data: {
                userId,
                generationId: jobId,
                event:        'job_succeeded',
                metadata:      { outputUrl },
            },
        })

        logger.info('Mesh generation complete', { jobId, outputUrl })


    } catch (err) {
        logger.error('Mesh generation failed', { jobId, error: String(err) })

        await jobStore.update(jobId, {
            status: 'failed',
            stage:  'Failed',
            error:   String(err),
        })

        await prisma.generation.update({
            where: { id: jobId },
            data: {
                status:  'failed',
                errorMessage: String(err),
                completedAt: new Date(),
            },
        })

        await prisma.usageLog.create({
            data: {
                userId, 
                generationId: jobId,
                event:        'job_failed',
                metadata:     { error: String(err) },
            },
        })
        throw err
    }
    
}
