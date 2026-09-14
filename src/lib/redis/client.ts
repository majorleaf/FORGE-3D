import { createClient } from "redis";

const globalForRedis = globalThis as unknown as {
    redis: ReturnType<typeof createClient> | undefined
}

export const redis = 
  globalForRedis.redis ??
  createClient({
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  })

redis.on('error', (err) => console.error('[Redis] Client error:', err))
redis.on('connect', () => console.log('[Redis] Connected'))

if (!redis.isOpen) {
    redis.connect()
}

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

export default redis