import { useState, useEffect } from 'react'

/**
 * Returns `true` once the page has scrolled past `threshold` pixels.
 *
 * Uses a passive scroll listener so it never blocks the main thread.
 * Commonly used to add a shadow/border to sticky navigation bars.
 *
 * @param threshold - Scroll distance in pixels before the hook returns `true` (default: 8)
 */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
