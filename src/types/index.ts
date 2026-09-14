export type JobStatus = 'pending' | 'in_progress' | 'succeeded' | 'failed'

export type JobType = 'text' | 'image'

export type StyleType = 'realistic' | 'stylized' | 'lowpoly' | 'sculptural'

export type ResolutionType = 'draft' | 'standard' | 'high' | 'ultra'

export type OutputFormat = 'stl' | 'obj' | 'step'

export interface Dimensions {
  width?: number
  height?: number
  depth?: number
  unit: 'mm' | 'cm' | 'm' | 'in'
}

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

export interface Generation {
  id: string
  userId: string | null
  jobType: JobType
  prompt: string | null
  style: StyleType
  resolution: ResolutionType
  dimensions: Dimensions | null
  status: JobStatus
  progress: number
  outputUrl: string | null
  outputFormat: OutputFormat | null
  thumbnailUrl: string | null
  openscadCode: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  plan: 'free' | 'pro' | 'enterprise'
  credits: number
  createdAt: string
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}