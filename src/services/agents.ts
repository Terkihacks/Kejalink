/**
 * Agent profile + leads - all routes require an authenticated AGENT session.
 */

import { api, ApiError, isMockMode } from '@/lib/api'
import type { AgentApplyInput, AgentProfile, AgentLead } from '@/features/agent/types'

function delay<T>(value: T, ms = 700): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

const MOCK_PROFILE: AgentProfile = {
  id:                    'mock-agent-profile-001',
  userId:                'mock-agent-001',
  name:                  'Test Agent',
  phone:                 '254700000000',
  bio:                   'Mock agent profile for local development.',
  serviceAreas:          ['Kilimani', 'Westlands'],
  propertyTypes:         ['apartment', 'studio'],
  idFrontPhotoUrl:       null,
  idBackPhotoUrl:        null,
  livenessVideoUrl:      null,
  livenessCode:          null,
  livenessCodeExpiresAt: null,
  ecitizenIdNumber:      null,
  socialMediaUrl:        null,
  verificationStatus:    'PENDING',
  accountStatus:         'ACTIVE',
  createdAt:             new Date().toISOString(),
  updatedAt:             new Date().toISOString(),
  verification: {
    status:              'PENDING',
    isIdReadable:        null,
    isFaceMatching:      null,
    isLivenessConfirmed: null,
    isEcitizenVerified:  null,
  },
}

const MOCK_LEADS: AgentLead[] = [
  {
    id: 'mock-lead-001', requestId: 'mock-req-101', agentId: 'mock-agent-001', rank: 1,
    status: 'NOTIFIED', notifiedAt: new Date().toISOString(), respondedAt: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    request: { id: 'mock-req-101', area: 'Kilimani', budgetMin: 15_000, budgetMax: 30_000, bedrooms: 1, timeline: 'ASAP', status: 'MATCHED', expiresAt: new Date(Date.now() + 86_400_000).toISOString() },
  },
  {
    id: 'mock-lead-002', requestId: 'mock-req-102', agentId: 'mock-agent-001', rank: 2,
    status: 'NOTIFIED', notifiedAt: new Date().toISOString(), respondedAt: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    request: { id: 'mock-req-102', area: 'Westlands', budgetMin: 20_000, budgetMax: 40_000, bedrooms: 2, timeline: 'WITHIN_1_MONTH', status: 'MATCHED', expiresAt: new Date(Date.now() + 86_400_000).toISOString() },
  },
]

let mockLeadsState = MOCK_LEADS.map(l => ({ ...l }))

export async function applyAsAgent(input: AgentApplyInput): Promise<AgentProfile> {
  if (isMockMode) return delay({ ...MOCK_PROFILE, ...input })
  return api.post<AgentProfile>('/agents/apply', input, 'agent')
}

export async function updateAgentProfile(input: Partial<AgentApplyInput>): Promise<AgentProfile> {
  if (isMockMode) return delay({ ...MOCK_PROFILE, ...input })
  return api.patch<AgentProfile>('/agents/me', input, 'agent')
}

/** Returns null instead of throwing when the agent hasn't applied yet (404). */
export async function getMyAgentProfile(): Promise<AgentProfile | null> {
  if (isMockMode) return delay(MOCK_PROFILE)
  try {
    return await api.get<AgentProfile>('/agents/me', 'agent')
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function getAgentLeads(): Promise<AgentLead[]> {
  if (isMockMode) return delay(mockLeadsState.filter(l => l.status !== 'DECLINED'))
  return api.get<AgentLead[]>('/agents/leads', 'agent')
}

export async function acceptLead(matchId: string): Promise<{ message: string; matchId: string }> {
  if (isMockMode) {
    mockLeadsState = mockLeadsState.map(l => l.id === matchId ? { ...l, status: 'ACCEPTED', respondedAt: new Date().toISOString() } : l)
    return delay({ message: 'Lead accepted successfully', matchId })
  }
  return api.post<{ message: string; matchId: string }>(`/agents/leads/${matchId}/accept`, {}, 'agent')
}

export async function declineLead(matchId: string): Promise<{ message: string; matchId: string; rematch: string }> {
  if (isMockMode) {
    mockLeadsState = mockLeadsState.map(l => l.id === matchId ? { ...l, status: 'DECLINED', respondedAt: new Date().toISOString() } : l)
    return delay({ message: 'Lead declined', matchId, rematch: 'no agents available' })
  }
  return api.post<{ message: string; matchId: string; rematch: string }>(`/agents/leads/${matchId}/decline`, {}, 'agent')
}
