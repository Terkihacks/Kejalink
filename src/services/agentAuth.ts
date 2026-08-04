/**
 * Agent OTP auth — request-otp / verify-otp / logout.
 *
 * Mock branch: any phone succeeds, code '123456' always verifies.
 */

import { api, isMockMode } from '@/lib/api'
import type { AuthUser } from '@/lib/auth-storage'

export interface RequestOtpResult {
  message: string
  otpExists: boolean
}

export interface VerifyAgentOtpResult {
  accessToken: string
  refreshToken: string
  user: AuthUser
  hasProfile: boolean
}

function delay<T>(value: T, ms = 700): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

export async function requestAgentOtp(phone: string): Promise<RequestOtpResult> {
  if (isMockMode) {
    return delay({ message: 'OTP sent successfully', otpExists: false })
  }
  return api.post<RequestOtpResult>('/auth/agent/request-otp', { phone })
}

export async function verifyAgentOtp(phone: string, code: string): Promise<VerifyAgentOtpResult> {
  if (isMockMode) {
    return delay({
      accessToken:  'mock-agent-access-token',
      refreshToken: 'mock-agent-refresh-token',
      user: { id: 'mock-agent-001', role: 'AGENT', phone: phone.replace(/\D/g, '') },
      hasProfile: false,
    })
  }
  return api.post<VerifyAgentOtpResult>('/auth/agent/verify-otp', { phone, code })
}

/**
 * Unlike renter logout, agent logout has no Authorization-header fallback —
 * the refreshToken must always be sent in the body.
 */
export async function logoutAgent(refreshToken: string): Promise<{ message: string }> {
  if (isMockMode) return delay({ message: 'Logged out successfully' })
  return api.post<{ message: string }>('/auth/agent/logout', { refreshToken })
}
