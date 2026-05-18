/**
 * TanStack Query hooks for house request data.
 *
 * - useSubmitRequest  — mutation for the 5-step form
 * - useRequestStatus  — polling query for agent count + request state
 * - useNotifications  — polling query for agent notification feed
 */

import { useMutation, useQuery } from '@tanstack/react-query'
import { submitRequest, getRequest, getNotifications } from '@/services/requests'
import type { HouseRequestInput } from '@/types'

/** Submit the form. On success, `data.id` is the new request ID. */
export function useSubmitRequest() {
  return useMutation({
    mutationFn: (input: HouseRequestInput) => submitRequest(input),
  })
}

/**
 * Poll the request record every 5 seconds.
 * Disabled when `id` is null/undefined (no request submitted yet).
 */
export function useRequestStatus(id: string | null | undefined) {
  return useQuery({
    queryKey:        ['request', id],
    queryFn:         () => getRequest(id!),
    enabled:         !!id,
    refetchInterval: 5_000,
    // Data stays fresh for 4s — avoids a redundant refetch if the component
    // remounts within the poll window (e.g. React StrictMode double-invoke).
    staleTime:       4_000,
    // Keep cached data for 2 min after the component unmounts so a back-
    // navigation restores instantly instead of showing a skeleton.
    gcTime:          2 * 60 * 1_000,
  })
}

/**
 * Poll agent notifications every 8 seconds.
 * Disabled when `id` is null/undefined.
 */
export function useNotifications(id: string | null | undefined) {
  return useQuery({
    queryKey:        ['notifications', id],
    queryFn:         () => getNotifications(id!),
    enabled:         !!id,
    refetchInterval: 8_000,
    staleTime:       7_000,
    gcTime:          2 * 60 * 1_000,
    // Keep showing previous data while a refetch is in flight — no flicker.
    placeholderData: (prev) => prev,
  })
}
