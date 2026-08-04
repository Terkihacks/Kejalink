import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthSession } from '@/hooks'
import type { SessionKind, AuthRole } from '@/lib/auth-storage'

interface RequireAuthProps {
  kind: SessionKind
  roles?: AuthRole[]
  children: ReactNode
}

/**
 * Presence/role gate for a stored session — no JWT expiry decoding here,
 * that's handled transparently by api.ts's refresh-and-retry. If a query
 * or mutation ultimately fails with a cleared session, the page itself
 * should redirect (this component only covers the initial route entry).
 */
export function RequireAuth({ kind, roles, children }: RequireAuthProps) {
  const session = useAuthSession(kind)
  const location = useLocation()

  if (!session || (roles && !roles.includes(session.user.role))) {
    return <Navigate to={`/${kind}/login`} replace state={{ from: location }} />
  }

  return children
}
