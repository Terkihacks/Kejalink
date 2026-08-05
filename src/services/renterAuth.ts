/**
 * Renter OTP auth - request-otp / verify-otp / logout.
 *
 * Mock branch: any phone succeeds, code '123456' always verifies.
 */

import { api, isMockMode } from '@/lib/api'
import type { AuthUser } from '@/lib/auth-storage'

export interface RequestOtpResult {
  message: string
  otpExists: boolean
}

export interface VerifyOtpResult {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

function delay<T>(value: T, ms = 700): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

export async function requestRenterOtp(phone: string): Promise<RequestOtpResult> {
  if (isMockMode) {
    return delay({ message: 'OTP sent successfully', otpExists: false })
  }
  return api.post<RequestOtpResult>('/auth/renter/request-otp', { phone })
}

export async function verifyRenterOtp(phone: string, code: string): Promise<VerifyOtpResult> {
  if (isMockMode) {
    return delay({
      accessToken:  'mock-renter-access-token',
      refreshToken: 'mock-renter-refresh-token',
      user: { id: 'mock-renter-001', role: 'RENTER', phone: phone.replace(/\D/g, '') },
    })
  }
  return api.post<VerifyOtpResult>('/auth/renter/verify-otp', { phone, code })
}

export async function logoutRenter(refreshToken: string): Promise<{ message: string }> {
  if (isMockMode) return delay({ message: 'Logged out successfully' })
  return api.post<{ message: string }>('/auth/renter/logout', { refreshToken })
}
