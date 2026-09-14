import redis from './client'

const WINDOW_MS = 60 * 60      // 1 hour window
const MAX_REQUESTS = 10         // max generations per hour per user

export async function checkRateLimit(userId: string): Promise<{
  allowed: boolean
  remaining: number
  resetIn: number
}> {
  const key = `ratelimit:${userId}`
  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, WINDOW_MS)
  }

  const ttl = await redis.ttl(key)

  return {
    allowed: current <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - current),
    resetIn: ttl,
  }
}