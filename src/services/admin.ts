/**
 * Admin agent-management, verification-review, and appeals endpoints.
 * All routes require an authenticated ADMIN or SUPER_ADMIN session.
 */

import { api, isMockMode } from '@/lib/api'
import type {
  AdminAgentListItem, AdminAgentDetail, AdminAgentListParams, AdminSuspension,
  VerificationQueueItem, VerificationApproveInput, AppealResolution, AgentStatusSummary,
} from '@/features/admin/types'

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

function query(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
  if (entries.length === 0) return ''
  return `?${new URLSearchParams(entries).toString()}`
}

/* ─── Mock data ──────────────────────────────────────────────────── */

const MOCK_AGENTS: AdminAgentListItem[] = [
  {
    id: 'mock-agent-001', name: 'Jane Mwangi', phone: '254711111111',
    serviceAreas: ['Kilimani', 'Westlands'], propertyTypes: ['apartment', 'studio'],
    verificationStatus: 'VERIFIED', accountStatus: 'ACTIVE', createdAt: new Date().toISOString(),
    verification: { status: 'VERIFIED', reviewedAt: new Date().toISOString() },
    suspensions: [],
  },
  {
    id: 'mock-agent-002', name: 'Kevin Otieno', phone: '254722222222',
    serviceAreas: ['Kilimani'], propertyTypes: ['apartment'],
    verificationStatus: 'PENDING', accountStatus: 'ACTIVE', createdAt: new Date().toISOString(),
    verification: { status: 'PENDING', reviewedAt: null },
    suspensions: [],
  },
]

const MOCK_VERIFICATION_QUEUE: VerificationQueueItem[] = [
  {
    id: 'mock-verification-002', agentId: 'mock-agent-002', status: 'PENDING',
    isIdReadable: null, isFaceMatching: null, isLivenessConfirmed: null, isEcitizenVerified: null, isSocialMediaValid: null,
    reviewedBy: null, reviewedAt: null, rejectionReason: null, reapplyAllowedAt: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    agent: {
      id: 'mock-agent-002', name: 'Kevin Otieno', phone: '254722222222', serviceAreas: ['Kilimani'],
      idFrontPhotoUrl: 'https://placehold.co/400x250?text=ID+Front',
      idBackPhotoUrl:  'https://placehold.co/400x250?text=ID+Back',
      livenessVideoUrl: null, livenessCode: null, ecitizenIdNumber: 'KE-B654321', socialMediaUrl: null,
      verificationStatus: 'PENDING', createdAt: new Date().toISOString(),
    },
  },
]

let mockSuspensions: AdminSuspension[] = []

/* ─── Agents ─────────────────────────────────────────────────────── */

export async function listAgents(params: AdminAgentListParams = {}): Promise<AdminAgentListItem[]> {
  if (isMockMode) return delay(MOCK_AGENTS)
  const qs = query({ verificationStatus: params.verificationStatus, accountStatus: params.accountStatus, search: params.search })
  return api.get<AdminAgentListItem[]>(`/admin/agents${qs}`, 'admin')
}

export async function getAgent(id: string): Promise<AdminAgentDetail> {
  if (isMockMode) {
    const agent = MOCK_AGENTS.find(a => a.id === id) ?? MOCK_AGENTS[0]
    return delay({
      ...agent,
      user: { id: agent.id, phone: agent.phone, name: agent.name, isActive: true },
      deletedAt: null,
      verification: agent.verification && { ...agent.verification, isIdReadable: null, isFaceMatching: null, isLivenessConfirmed: null, isEcitizenVerified: null },
    })
  }
  return api.get<AdminAgentDetail>(`/admin/agents/${id}`, 'admin')
}

export async function suspendAgent(id: string, reason: string): Promise<AdminSuspension> {
  if (isMockMode) {
    const suspension: AdminSuspension = { id: `mock-susp-${id}`, agentId: id, suspendedBy: 'mock-admin-001', reason, isActive: true, suspendedAt: new Date().toISOString() }
    mockSuspensions = [...mockSuspensions, suspension]
    return delay(suspension)
  }
  return api.post<AdminSuspension>(`/admin/agents/${id}/suspend`, { reason }, 'admin')
}

export async function unsuspendAgent(id: string): Promise<AgentStatusSummary> {
  if (isMockMode) return delay({ id, name: MOCK_AGENTS.find(a => a.id === id)?.name ?? 'Agent', accountStatus: 'ACTIVE' })
  return api.post<AgentStatusSummary>(`/admin/agents/${id}/unsuspend`, {}, 'admin')
}

/* ─── Appeals ────────────────────────────────────────────────────── */

export async function listAppeals(): Promise<AdminSuspension[]> {
  if (isMockMode) return delay(mockSuspensions.filter(s => !!s.appealText))
  return api.get<AdminSuspension[]>('/admin/appeals', 'admin')
}

export async function escalateAppeal(id: string): Promise<AdminSuspension> {
  if (isMockMode) {
    const suspension = mockSuspensions.find(s => s.id === id)!
    suspension.escalated = true
    return delay(suspension)
  }
  return api.post<AdminSuspension>(`/admin/appeals/${id}/escalate`, {}, 'admin')
}

export async function resolveAppeal(id: string, resolution: AppealResolution): Promise<AdminSuspension> {
  if (isMockMode) {
    const suspension = mockSuspensions.find(s => s.id === id)!
    suspension.resolution = resolution
    suspension.resolvedAt = new Date().toISOString()
    return delay(suspension)
  }
  return api.post<AdminSuspension>(`/admin/appeals/${id}/resolve`, { resolution }, 'admin')
}

/* ─── Verifications ──────────────────────────────────────────────── */

export async function listVerifications(): Promise<VerificationQueueItem[]> {
  if (isMockMode) return delay(MOCK_VERIFICATION_QUEUE)
  return api.get<VerificationQueueItem[]>('/admin/verifications', 'admin')
}

export async function getVerification(agentId: string): Promise<VerificationQueueItem> {
  if (isMockMode) return delay(MOCK_VERIFICATION_QUEUE.find(v => v.agentId === agentId) ?? MOCK_VERIFICATION_QUEUE[0])
  return api.get<VerificationQueueItem>(`/admin/verifications/${agentId}`, 'admin')
}

export async function approveVerification(agentId: string, checklist: VerificationApproveInput): Promise<AgentStatusSummary> {
  if (isMockMode) return delay({ id: agentId, name: 'Agent', verificationStatus: 'VERIFIED' })
  return api.post<AgentStatusSummary>(`/admin/verifications/${agentId}/approve`, checklist, 'admin')
}

export async function rejectVerification(agentId: string, reason: string): Promise<AgentStatusSummary> {
  if (isMockMode) return delay({ id: agentId, name: 'Agent', verificationStatus: 'REJECTED' })
  return api.post<AgentStatusSummary>(`/admin/verifications/${agentId}/reject`, { reason }, 'admin')
}

/* ─── Super-admin bootstrap ──────────────────────────────────────── */

export async function createAdmin(input: { email: string; password: string; name?: string }): Promise<{ id: string; email: string; name: string | null; role: 'ADMIN' }> {
  if (isMockMode) return delay({ id: 'mock-admin-new', email: input.email, name: input.name ?? null, role: 'ADMIN' })
  return api.post<{ id: string; email: string; name: string | null; role: 'ADMIN' }>('/admin/admins', input, 'admin')
}
