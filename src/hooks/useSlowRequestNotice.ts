import { useEffect, useState } from 'react'

/**
 * True once `isPending` has been true for longer than `delayMs`.
 *
 * The backend's free-tier host spins down after ~15 min idle, so the first
 * request after a lull can take 30-50s to wake it up. Use this to swap in
 * a "waking up the server" message instead of leaving a bare spinner that
 * looks hung.
 */
export function useSlowRequestNotice(isPending: boolean, delayMs = 4000): boolean {
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    if (!isPending) {
      setIsSlow(false)
      return
    }
    const timer = setTimeout(() => setIsSlow(true), delayMs)
    return () => clearTimeout(timer)
  }, [isPending, delayMs])

  return isSlow
}
