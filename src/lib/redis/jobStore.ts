import redis from './client'

export type JobStatus = 'pending' | 'in_progress' | 'succeeded' | 'failed'

export interface Job {
  id: string
  status: JobStatus
  progress: number
  stage: string
  modelUrl: string | null
  thumbnailUrl: string | null
  error: string | null
  createdAt: string
}

const JOB_TTL = 60 * 60 * 24 // 24 hours

export const jobStore = {
  async set(jobId: string, data: Partial<Job>) {
    await redis.setEx(`job:${jobId}`, JOB_TTL, JSON.stringify(data))
  },

  async get(jobId: string): Promise<Job | null> {
    const data = await redis.get(`job:${jobId}`)
    return data ? JSON.parse(data) : null
  },

  async update(jobId: string, patch: Partial<Job>) {
    const existing = await jobStore.get(jobId)
    if (!existing) return
    await redis.setEx(`job:${jobId}`, JOB_TTL, JSON.stringify({ ...existing, ...patch }))
  },

  async delete(jobId: string) {
    await redis.del(`job:${jobId}`)
  },
}