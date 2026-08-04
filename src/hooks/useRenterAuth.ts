import { useMutation } from '@tanstack/react-query'
import { requestRenterOtp, verifyRenterOtp } from '@/services/renterAuth'

export function useRequestRenterOtp() {
  return useMutation({
    mutationFn: (phone: string) => requestRenterOtp(phone),
  })
}

export function useVerifyRenterOtp() {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) => verifyRenterOtp(phone, code),
  })
}
