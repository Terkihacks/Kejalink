import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listAgents, getAgent, suspendAgent, unsuspendAgent,
  listAppeals, escalateAppeal, resolveAppeal,
  listVerifications, getVerification, approveVerification, rejectVerification,
} from '@/services/admin'
import type { AdminAgentListParams, VerificationApproveInput, AppealResolution } from '@/features/admin/types'

const AGENTS_KEY = ['admin-agents']
const AGENT_KEY = (id: string) => ['admin-agent', id]
const APPEALS_KEY = ['admin-appeals']
const VERIFICATIONS_KEY = ['admin-verifications']
const VERIFICATION_KEY = (agentId: string) => ['admin-verification', agentId]

export function useAdminAgents(params: AdminAgentListParams = {}) {
  return useQuery({
    queryKey: [...AGENTS_KEY, params],
    queryFn:  () => listAgents(params),
  })
}

export function useAdminAgent(id: string | undefined) {
  return useQuery({
    queryKey: AGENT_KEY(id ?? ''),
    queryFn:  () => getAgent(id!),
    enabled:  !!id,
  })
}

export function useSuspendAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => suspendAgent(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: AGENTS_KEY })
      queryClient.invalidateQueries({ queryKey: AGENT_KEY(id) })
    },
  })
}

export function useUnsuspendAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unsuspendAgent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: AGENTS_KEY })
      queryClient.invalidateQueries({ queryKey: AGENT_KEY(id) })
    },
  })
}

export function useAdminAppeals() {
  return useQuery({ queryKey: APPEALS_KEY, queryFn: listAppeals })
}

export function useEscalateAppeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => escalateAppeal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPEALS_KEY }),
  })
}

export function useResolveAppeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: AppealResolution }) => resolveAppeal(id, resolution),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: APPEALS_KEY }),
  })
}

export function useVerificationsQueue() {
  return useQuery({ queryKey: VERIFICATIONS_KEY, queryFn: listVerifications })
}

export function useVerificationDetail(agentId: string | undefined) {
  return useQuery({
    queryKey: VERIFICATION_KEY(agentId ?? ''),
    queryFn:  () => getVerification(agentId!),
    enabled:  !!agentId,
  })
}

export function useApproveVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ agentId, checklist }: { agentId: string; checklist: VerificationApproveInput }) => approveVerification(agentId, checklist),
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: VERIFICATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: AGENTS_KEY })
      queryClient.invalidateQueries({ queryKey: VERIFICATION_KEY(agentId) })
    },
  })
}

export function useRejectVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ agentId, reason }: { agentId: string; reason: string }) => rejectVerification(agentId, reason),
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: VERIFICATIONS_KEY })
      queryClient.invalidateQueries({ queryKey: AGENTS_KEY })
      queryClient.invalidateQueries({ queryKey: VERIFICATION_KEY(agentId) })
    },
  })
}
