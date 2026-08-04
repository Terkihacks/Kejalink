import { useMutation } from '@tanstack/react-query'
import { requestAgentOtp, verifyAgentOtp } from '@/services/agentAuth'

export function useRequestAgentOtp() {
  return useMutation({
    mutationFn: (phone: string) => requestAgentOtp(phone),
  })
}

export function useVerifyAgentOtp() {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) => verifyAgentOtp(phone, code),
  })
}
