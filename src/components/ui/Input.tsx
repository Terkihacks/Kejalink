import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Styled text input.
 *
 * A thin wrapper around the native `<input>` element that applies
 * the KejaLink design system's focus ring, border, and disabled states.
 * All standard input props are forwarded unchanged.
 *
 * @example
 * <Input type="tel" placeholder="712 345 678" value={phone} onChange={…} />
 */
export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1',
        'text-base shadow-xs transition-[color,box-shadow] outline-none',
        'placeholder:text-muted-foreground',
        'selection:bg-primary selection:text-primary-foreground',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        'md:text-sm',
        className,
      )}
      {...props}
    />
  )
}
