/**
 * Typed fetch wrapper for the KejaLink API.
 *
 * Set VITE_API_BASE_URL in your .env file to point at your backend.
 * When the variable is absent the app runs in mock mode - all calls
 * resolve with realistic fake data so the UI works without a backend.
 *
 * The real backend wraps every response in an envelope:
 *   success: { success: true, data: T }
 *   error:   { success: false, code: string, message: string | string[], statusCode: number }
 * `/health` is the one exception - it returns a flat, unwrapped body.
 */

import { getSession, setSession, clearSession, type SessionKind } from '@/lib/auth-storage'

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

/* ─── Envelope types ─────────────────────────────────────────────── */

interface ApiSuccessEnvelope<T> {
  success: true
  data: T
}

interface ApiErrorEnvelope {
  success: false
  code: string
  message: string | string[]
  statusCode: number
}

type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope

function errorFromEnvelope(status: number, body: Partial<ApiErrorEnvelope>): ApiError {
  const message = Array.isArray(body.message) ? body.message.join(' ') : body.message
  return new ApiError(status, message ?? 'Request failed', body.code)
}

/* ─── Token refresh ──────────────────────────────────────────────── */

async function refreshSession(kind: SessionKind): Promise<boolean> {
  const session = getSession(kind)
  if (!session) return false

  const res = await fetch(`${BASE_URL}/auth/${kind}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })

  if (!res.ok) {
    clearSession(kind)
    return false
  }

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<{ accessToken: string; refreshToken: string }> | null
  if (!envelope || !envelope.success) {
    clearSession(kind)
    return false
  }

  setSession(kind, { ...session, accessToken: envelope.data.accessToken, refreshToken: envelope.data.refreshToken })
  return true
}

/* ─── Core fetch wrapper ─────────────────────────────────────────── */

interface RequestOptions extends RequestInit {
  auth?: SessionKind
}

async function request<T>(path: string, init: RequestOptions = {}, retried = false): Promise<T> {
  const { auth, headers, ...rest } = init
  const session = auth ? getSession(auth) : null

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...headers,
    },
  })

  // /health returns a flat, unwrapped body - never part of the envelope contract.
  if (path === '/health') {
    if (!res.ok) throw new ApiError(res.status, res.statusText)
    return res.json() as Promise<T>
  }

  const envelope = (await res.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!res.ok || !envelope || !envelope.success) {
    const errBody = envelope && !envelope.success ? envelope : { code: undefined, message: res.statusText, statusCode: res.status }

    if (res.status === 401 && auth && errBody.code !== 'SESSION_REVOKED' && !retried) {
      const refreshed = await refreshSession(auth)
      if (refreshed) return request<T>(path, init, true)
    }

    if (res.status === 401 && auth) clearSession(auth)
    throw errorFromEnvelope(res.status, errBody)
  }

  return envelope.data
}

/* ─── Public API ─────────────────────────────────────────────────── */

export const api = {
  get:    <T>(path: string, auth?: SessionKind)               => request<T>(path, { auth }),
  post:   <T>(path: string, body: unknown, auth?: SessionKind) => request<T>(path, { method: 'POST',   body: JSON.stringify(body), auth }),
  patch:  <T>(path: string, body: unknown, auth?: SessionKind) => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body), auth }),
  delete: <T>(path: string, auth?: SessionKind)                => request<T>(path, { method: 'DELETE', auth }),
  health: ()                                                   => request<{ status: 'ok' | 'degraded'; timestamp: string; checks: { database: string } }>('/health'),
}

/** True when the app is running without a configured backend. */
export const isMockMode = BASE_URL === ''
