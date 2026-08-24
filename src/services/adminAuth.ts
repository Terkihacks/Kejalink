/**
 * Admin email+password+TOTP auth - two-step login.
 */

import { api, isMockMode } from '@/lib/api'
import type { AuthUser } from '@/lib/auth-storage'

export interface AdminLoginResult {
  sessionId:   string
  requires2fa: boolean
  /**
   * Only present as a dev/bootstrap convenience before TOTP has been configured.
   * The frontend only surfaces this in import.meta.env.DEV (see AdminLoginPage) -
   * displaying it in prod would let a password alone bypass the second factor.
   */
  otpCode?:    string
}

export interface VerifyAdmin2faResult {
  accessToken:  string
  refreshToken: string
  user:         AuthUser
}

export interface Setup2faResult {
  secret:    string
  qrCodeUri: string
}

function delay<T>(value: T, ms = 700): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

export async function adminLogin(email: string, password: string): Promise<AdminLoginResult> {
  if (isMockMode) {
    return delay({ sessionId: 'mock-admin-session', requires2fa: true, otpCode: '123456' })
  }
  return api.post<AdminLoginResult>('/auth/admin/login', { email, password })
}

export async function verifyAdmin2fa(sessionId: string, code: string): Promise<VerifyAdmin2faResult> {
  if (isMockMode) {
    return delay({
      accessToken:  'mock-admin-access-token',
      refreshToken: 'mock-admin-refresh-token',
      user: { id: 'mock-admin-001', role: 'ADMIN', email: 'admin@kejalink.co.ke', name: 'Mock Admin' },
    })
  }
  return api.post<VerifyAdmin2faResult>('/auth/admin/verify-2fa', { sessionId, code })
}

export async function setupAdmin2fa(email: string): Promise<Setup2faResult> {
  return api.post<Setup2faResult>('/auth/admin/setup-2fa', { email }, 'admin')
}

export async function disableAdmin2fa(): Promise<{ message: string }> {
  return api.post<{ message: string }>('/auth/admin/disable-2fa', {}, 'admin')
}
