/**
 * Shared Framer Motion variants used across the KejaLink UI.
 *
 * All variants respect the user's `prefers-reduced-motion` preference -
 * call `useReducedMotion()` from framer-motion in the component and pass
 * `{ opacity: 1 }` as the initial state when it returns true.
 */

import type { Variants } from 'framer-motion'

/** Fade up - general purpose entry for text / cards. */
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

/** Plain fade in - for decorative or secondary elements. */
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

/** Spring scale pop - success icons, badge pops. */
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale:   1,
    transition: { type: 'spring', stiffness: 320, damping: 22 },
  },
}

/** Slide in from right - multi-step form transitions (enter). */
export const slideRight: Variants = {
  hidden:  { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, x: -16, transition: { duration: 0.2, ease: 'easeIn' } },
}

/**
 * Stagger container - wrap a list of `motion` children so they animate
 * in one after another.
 *
 * @param delay   initial delay before first child (default 0)
 * @param stagger gap between children in seconds (default 0.1)
 */
export function staggerContainer(delay = 0, stagger = 0.1): Variants {
  return {
    hidden:  {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  }
}
