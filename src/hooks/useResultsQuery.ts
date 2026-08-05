import { useQuery } from '@tanstack/react-query'
import { getResultsByToken } from '@/services/results'

/**
 * Poll the magic-link results record every 5 seconds.
 * Disabled when `token` is null/undefined.
 */
export function useRequestResults(token: string | null | undefined) {
  return useQuery({
    queryKey:        ['results', token],
    queryFn:         () => getResultsByToken(token!),
    enabled:         !!token,
    refetchInterval: 5_000,
    // Data stays fresh for 4s - avoids a redundant refetch if the component
    // remounts within the poll window (e.g. React StrictMode double-invoke).
    staleTime:       4_000,
    // Keep cached data for 2 min after the component unmounts so a back-
    // navigation restores instantly instead of showing a skeleton.
    gcTime:          2 * 60 * 1_000,
  })
}
