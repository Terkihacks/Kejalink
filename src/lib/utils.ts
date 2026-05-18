import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS class names with full conflict resolution.
 *
 * Combines `clsx` for conditional/array class assembly with `tailwind-merge`
 * for deduplication of conflicting utility classes (e.g. `px-4` + `px-6` → `px-6`).
 *
 * @param inputs - Any number of `ClassValue` arguments: strings, arrays, or objects
 * @returns A single deduplicated, merged class string
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-primary', 'px-6')
 * // → 'py-2 bg-primary px-6'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
