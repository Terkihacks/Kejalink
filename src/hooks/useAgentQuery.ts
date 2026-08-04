import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applyAsAgent, updateAgentProfile, getMyAgentProfile, getAgentLeads, acceptLead, declineLead } from '@/services/agents'
import type { AgentApplyInput } from '@/features/agent/types'

const PROFILE_KEY = ['agent-profile']
const LEADS_KEY = ['agent-leads']

export function useAgentProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn:  getMyAgentProfile,
  })
}

export function useApplyAsAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AgentApplyInput) => applyAsAgent(input),
    onSuccess: profile => queryClient.setQueryData(PROFILE_KEY, profile),
  })
}

export function useUpdateAgentProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<AgentApplyInput>) => updateAgentProfile(input),
    onSuccess: profile => queryClient.setQueryData(PROFILE_KEY, profile),
  })
}

export function useAgentLeads() {
  return useQuery({
    queryKey:        LEADS_KEY,
    queryFn:         getAgentLeads,
    refetchInterval: 15_000,
    staleTime:       10_000,
  })
}

export function useAcceptLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (matchId: string) => acceptLead(matchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  })
}

export function useDeclineLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (matchId: string) => declineLead(matchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  })
}
