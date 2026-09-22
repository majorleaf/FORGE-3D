import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { jobStore } from '@/lib/redis/jobStore'
import { cache, hashPrompt } from '@/lib/redis/cache'
import { checkRateLimit } from '@/lib/redis/rateLimit'
import { textGenerateSchema } from '@/lib/utils/validator'
import { AuthError, RateLimitError, ValidationError } from '@/lib/utils/errors'
import { generateMesh } from '@/lib/jobs/generateMesh'
import { logger } from '@/lib/utils/logger'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Auth
//  Auth
const authHeader = request.headers.get('authorization')
const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

const supabase = await createClient(token ?? undefined)
const { data: { user } } = await supabase.auth.getUser()

if (!user) throw new AuthError()

    // Input validation
    const body = await request.json()
    const parsed = textGenerateSchema.safeParse(body)

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }

    const { prompt, style, resolution, dimensions, negativePrompt } = parsed.data

    // rate limit
    const { allowed, remaining, resetIn } = await checkRateLimit(user.id)

    if (!allowed) throw new RateLimitError(resetIn)

    // cache checking
    const cacheKey = hashPrompt(prompt, style)
    const cached = await cache.get(cacheKey)

    if (cached) {
      logger.info('Cache hit', { prompt, style, userId: user.id })
      return NextResponse.json({ jobId: null, cached: true, result: JSON.parse(cached) })
    }

    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
      }
    })

    //   Create job
    const jobId = randomUUID()

    await jobStore.set(jobId, {
      id:          jobId,
      status:      'pending',
      progress:    0,
      stage:       'Queued',
      modelUrl:    null,
      thumbnailUrl:null,
      error:       null,
      createdAt:   new Date().toISOString(),
    })

    //  Write to database
    await prisma.generation.create({
      data: {
        id:             jobId,
        userId:         user.id,
        jobType:        'text',
        prompt,
        negativePrompt,
        style,
        resolution,
        dimensions:     dimensions ?? {},
        internalJobId:  jobId,
        status:         'pending',
      },
    })

    // Log usage 
    await prisma.usageLog.create({
      data: {
        userId:       user.id,
        generationId: jobId,
        event:        'job_submitted',
        metadata:     { prompt, style, resolution, remaining },
      },
    })

    logger.info('Job created', { jobId, userId: user.id, prompt })

    // Return jobId (generation runs in background) 
    //return NextResponse.json({ jobId }, { status: 201 })
    generateMesh({
        jobId,
        userId:   user.id,
        prompt,
        style,
        resolution,
        dimensions,
    }).catch((err) => {
        logger.error('Background job failed',  { jobId, error: String(err) })
    })
           
     return NextResponse.json({ jobId }, { status: 201 })

  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 })
    }

    logger.error('Generate text error', { error: String(err) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}