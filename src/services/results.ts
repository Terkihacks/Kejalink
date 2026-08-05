/**
 * Public magic-link results lookup - no auth required.
 */

import { api, isMockMode } from '@/lib/api'
import type { RequestResult } from '@/types'

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

const MOCK_RESULT: RequestResult = {
  id:                'mock-req-001',
  area:              'Kilimani',
  budgetMin:         15_000,
  budgetMax:         30_000,
  bedrooms:          1,
  timeline:          'ASAP',
  status:            'MATCHED',
  matchedAgentCount: 2,
  expiresAt:         new Date(Date.now() + 48 * 60 * 60 * 1_000).toISOString(),
  createdAt:         new Date().toISOString(),
  matches: [
    {
      id:     'mock-match-001',
      rank:   1,
      status: 'ACCEPTED',
      agent: {
        id:            'mock-agent-001',
        name:          'Jane Mwangi',
        phone:         '254711111111',
        bio:           'Experienced agent specialising in Kilimani apartments.',
        serviceAreas:  ['Kilimani', 'Westlands'],
        propertyTypes: ['apartment', 'studio'],
      },
    },
    {
      id:     'mock-match-002',
      rank:   2,
      status: 'NOTIFIED',
      agent: {
        id:            'mock-agent-002',
        name:          'Kevin Otieno',
        phone:         '254722222222',
        bio:           'Kilimani and Kileleshwa rentals, 5+ years experience.',
        serviceAreas:  ['Kilimani', 'Kileleshwa'],
        propertyTypes: ['apartment'],
      },
    },
  ],
}

export async function getResultsByToken(token: string): Promise<RequestResult> {
  if (isMockMode) return delay(MOCK_RESULT, 500)
  return api.get<RequestResult>(`/results/${token}`)
}
