/**
 * Request service - creates a rental request as an authenticated renter.
 *
 * When VITE_API_BASE_URL is not set the module falls back to realistic
 * mock data so the UI remains fully functional without a backend.
 */

import { api, isMockMode } from '@/lib/api'
import type { CreateRequestInput, CreateRequestOutput } from '@/types'

function delay<T>(value: T, ms = 1_200): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

/**
 * Submit a new house request. Requires an authenticated renter session
 * (see useVerifyRenterOtp) - the phone number is tied to the JWT, not
 * part of the request body.
 */
export async function createRequest(input: CreateRequestInput): Promise<CreateRequestOutput> {
  if (isMockMode) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return delay({
      requestId:         'mock-req-001',
      status:            'MATCHED',
      magicLink:         `${origin}/results/mock-token-001`,
      matchedAgentCount: 2,
    }, 2_000)
  }

  return api.post<CreateRequestOutput>('/requests', input, 'renter')
}
