/**
 * Typed fetch wrapper for the KejaLink API.
 *
 * Set VITE_API_BASE_URL in your .env file to point at your backend.
 * When the variable is absent the app runs in mock mode — all calls
 * resolve with realistic fake data so the UI works without a backend.
 */

import type { ApiErrorBody } from '@/types'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

/* ─── Error class ────────────────────────────────────────────────── */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/* ─── Core fetch wrapper ─────────────────────────────────────────── */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  if (!res.ok) {
    const body: Partial<ApiErrorBody> = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.message ?? res.statusText, body.code)
  }

  // 204 No Content — return undefined cast to T
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

/* ─── Public API ─────────────────────────────────────────────────── */

export const api = {
  get:    <T>(path: string)                   => request<T>(path),
  post:   <T>(path: string, body: unknown)    => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)    => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)                   => request<T>(path, { method: 'DELETE' }),
}

/** True when the app is running without a configured backend. */
export const isMockMode = BASE_URL === ''
