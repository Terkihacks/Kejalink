/**
 * Session persistence for the three independent auth flows (renter/agent/admin).
 *
 * One localStorage key per session kind — mirrors the read/write pattern
 * used by useTheme.ts ('keja-theme'), just applied to a JSON blob instead
 * of a plain string. Separate keys let a renter tab, agent tab, and admin
 * tab coexist in the same browser during dev/testing without clobbering.
 */

export type SessionKind = 'renter' | 'agent' | 'admin'
export type AuthRole = 'RENTER' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN'

export interface AuthUser {
  id: string
  role: AuthRole
  phone?: string
  email?: string
  name?: string | null
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

/** Fired on every setSession/clearSession so hooks can react without polling. */
export const AUTH_CHANGE_EVENT = 'keja-auth-change'

function storageKey(kind: SessionKind): string {
  return `keja-auth-${kind}`
}

export function getSession(kind: SessionKind): AuthSession | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(storageKey(kind))
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function setSession(kind: SessionKind, session: AuthSession): void {
  localStorage.setItem(storageKey(kind), JSON.stringify(session))
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: { kind } }))
}

export function clearSession(kind: SessionKind): void {
  localStorage.removeItem(storageKey(kind))
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: { kind } }))
}
