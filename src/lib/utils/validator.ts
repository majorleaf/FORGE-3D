import { z } from 'zod'

export const textGenerateSchema = z.object({
  prompt:         z.string().min(3).max(500),
  style:          z.enum(['realistic', 'stylized', 'lowpoly', 'sculptural']).default('realistic'),
  resolution:     z.enum(['draft', 'standard', 'high', 'ultra']).default('standard'),
  dimensions: z.object({
    width:        z.number().positive().optional(),
    height:       z.number().positive().optional(),
    depth:        z.number().positive().optional(),
    unit:         z.enum(['mm', 'cm', 'm', 'in']).default('mm'),
  }).optional(),
  negativePrompt: z.string().max(200).optional(),
})

export const imageGenerateSchema = z.object({
  style:      z.enum(['realistic', 'stylized', 'lowpoly', 'sculptural']).default('realistic'),
  resolution: z.enum(['draft', 'standard', 'high', 'ultra']).default('standard'),
})

export type TextGenerateInput = z.infer<typeof textGenerateSchema>
export type ImageGenerateInput = z.infer<typeof imageGenerateSchema>