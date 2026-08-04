/**
 * TanStack Query hook for submitting a house request.
 */

import { useMutation } from '@tanstack/react-query'
import { createRequest } from '@/services/requests'

/** Submit the form. On success, `data.magicLink` points to the results page. */
export function useCreateRequest() {
  return useMutation({
    mutationFn: createRequest,
  })
}
