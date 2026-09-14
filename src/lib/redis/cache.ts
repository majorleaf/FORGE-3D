import redis from './client'
import crypto from 'crypto'

const CACHE_TTL = 60 * 60 * 24 * 7 // 7 days

export function hashPrompt(prompt: string, style: string): string {
  return crypto.createHash('sha256').update(`${prompt}:${style}`).digest('hex')
}

export const cache = {
  async get(key: string): Promise<string | null> {
    return redis.get(`cache:${key}`)
  },

  async set(key: string, value: string): Promise<void> {
    await redis.setEx(`cache:${key}`, CACHE_TTL, value)
  },

  async has(key: string): Promise<boolean> {
    const exists = await redis.exists(`cache:${key}`)
    return exists === 1
  },
}