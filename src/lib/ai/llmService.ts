import { HfInference } from '@huggingface/inference'
import { logger } from '@/lib/utils/logger'
import { prisma } from '@/lib/prisma/client'

const hf = new HfInference(process.env.HF_TOKEN)

export interface GenerateOpenSCADInput {
  prompt: string
  dimensions?: {
    width?: number
    height?: number
    depth?: number
    unit?: string
  }
  style: string
  userId?: string
  generationId?: string
}

export interface GenerateOpenSCADResult {
  code: string
  tokensUsed: number
}

export async function generateOpenSCADCode(
  input: GenerateOpenSCADInput
): Promise<GenerateOpenSCADResult> {
  const { prompt, dimensions, style, userId, generationId } = input

  // Build dimension context
  const dimContext = dimensions
    ? `Dimensions: width=${dimensions.width ?? 'unspecified'}${dimensions.unit}, height=${dimensions.height ?? 'unspecified'}${dimensions.unit}, depth=${dimensions.depth ?? 'unspecified'}${dimensions.unit}.`
    : ''

  const systemPrompt = `You are a CAD engineer. Generate precise OpenSCAD code based on the user's description and dimensions. 
Rules:
- Output ONLY valid OpenSCAD code, no explanation
- Use exact dimensions provided
- Code must be renderable by OpenSCAD CLI
- Use difference(), union(), intersection() for complex shapes
- Always end with the main shape call`

  const userPrompt = `Generate OpenSCAD code for: ${prompt}. ${dimContext} Style: ${style}.`

  const startTime = Date.now()

  try {
    const response = await hf.textGeneration({
      model:  'mistralai/Mistral-7B-Instruct-v0.3',
      inputs: `<s>[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`,
      parameters: {
        max_new_tokens:  512,
        temperature:     0.2,
        return_full_text: false,
      },
    })

    const code = response.generated_text.trim()
    const durationMs = Date.now() - startTime

    // Log cost to DB
    if (userId && generationId) {
      await prisma.usageLog.create({
        data: {
          userId,
          generationId,
          event:    'llm_call',
          metadata: {
            model:      'mistralai/Mistral-7B-Instruct-v0.3',
            durationMs,
            prompt:     userPrompt,
          },
        },
      })
    }

    logger.info('OpenSCAD code generated', { generationId, durationMs })

    return { code, tokensUsed: code.length }

  } catch (err) {
    logger.error('LLM generation failed', { error: String(err), generationId })
    throw err
  }
}
