import { useMutation } from '@tanstack/react-query'
import { adminLogin, verifyAdmin2fa } from '@/services/adminAuth'

export function useAdminLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => adminLogin(email, password),
  })
}

export function useVerifyAdmin2fa() {
  return useMutation({
    mutationFn: ({ sessionId, code }: { sessionId: string; code: string }) => verifyAdmin2fa(sessionId, code),
  })
}
