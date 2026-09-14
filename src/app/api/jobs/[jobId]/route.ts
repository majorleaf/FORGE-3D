import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jobStore } from '@/lib/redis/jobStore'
import { AuthError } from '@/lib/utils/errors'
import { logger } from '@/lib/utils/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    //  Auth 
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new AuthError()

    //  Get job from Redis 
    const { jobId } = await params
    const job = await jobStore.get(jobId)

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    logger.info('Job polled', { jobId, status: job.status, userId: user.id })

    return NextResponse.json(job)

  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }

    logger.error('Poll job error', { error: String(err) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}