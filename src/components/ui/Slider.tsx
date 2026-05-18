'use client'

import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

interface SliderProps extends Omit<ComponentProps<'input'>, 'value' | 'defaultValue' | 'onChange' | 'type'> {
  /**
   * Controlled value — single-element array to match shadcn/Radix Slider API.
   * e.g. `[15000]`
   */
  value?: number[]
  /** Uncontrolled initial value */
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  /** Called with a single-element array on every change */
  onValueChange?: (value: number[]) => void
}

/**
 * Range slider with visual track-fill and thumb.
 *
 * Implemented on a native `<input type="range">` with a transparent overlay
 * that intercepts all pointer/touch/keyboard events. The visual track and thumb
 * are purely presentational `<div>` elements driven by the current value.
 *
 * Maintains the same array-based API as the Radix UI Slider so existing call
 * sites require no changes.
 *
 * @example
 * <Slider value={[budget]} onValueChange={([v]) => setBudget(v)} min={5000} max={100000} step={1000} />
 */
export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
  disabled,
  ...props
}: SliderProps) {
  const current = (value ?? defaultValue ?? [min])[0]
  const pct     = ((current - min) / (max - min)) * 100

  return (
    <div
      data-slot="slider"
      className={cn('relative flex w-full touch-none select-none items-center py-1', className)}
    >
      {/* Visual track */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
        <div
          className="absolute h-full rounded-full bg-primary transition-[width] duration-75"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Visual thumb — pointer-events-none, purely decorative */}
      <div
        className={cn(
          'pointer-events-none absolute top-1/2 h-4 w-4',
          '-translate-x-1/2 -translate-y-1/2 rounded-full',
          'border-2 border-primary bg-background shadow-md',
          'transition-[left] duration-75',
        )}
        style={{ left: `${pct}%` }}
      />

      {/* Native range input — transparent, sits on top, handles all events */}
      <input
        {...props}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        onChange={e => onValueChange?.([Number(e.target.value)])}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
      />
    </div>
  )
}
