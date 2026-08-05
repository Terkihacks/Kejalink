import { useEffect, useState } from 'react'
import { getSession, AUTH_CHANGE_EVENT, type SessionKind, type AuthSession } from '@/lib/auth-storage'

/**
 * Reads the stored session for a given kind and re-renders whenever it
 * changes (login/logout/refresh) anywhere in the app - including other
 * components - via the AUTH_CHANGE_EVENT CustomEvent dispatched by
 * setSession/clearSession.
 */
export function useAuthSession(kind: SessionKind): AuthSession | null {
  const [session, setSessionState] = useState<AuthSession | null>(() => getSession(kind))

  useEffect(() => {
    const handleChange = () => setSessionState(getSession(kind))
    window.addEventListener(AUTH_CHANGE_EVENT, handleChange)
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, handleChange)
  }, [kind])

  return session
}
