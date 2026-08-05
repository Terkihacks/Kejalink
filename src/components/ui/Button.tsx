import { type ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Visual variants for the Button component.
 *
 * `default`     - primary brand green, glow shadow on hover
 * `destructive` - red, for irreversible or dangerous actions
 * `outline`     - transparent background, bordered, hover border turns green
 * `secondary`   - muted slate background
 * `ghost`       - no background until hover; ideal for icon-only actions
 * `link`        - appears as underlined text, no background
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md',
    'text-sm font-medium transition-all',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
    'shrink-0 [&_svg]:shrink-0',
    'outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90',
          'shadow-[0_0_20px_rgba(0,206,146,0.2)] hover:shadow-[0_0_30px_rgba(0,206,146,0.35)]',
        ],
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:     'border border-border bg-transparent hover:bg-muted/50 hover:border-primary/40 text-foreground',
        secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:       'hover:bg-muted/60 text-foreground/80 hover:text-foreground',
        link:        'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:   'h-9 px-4 py-2',
        sm:        'h-8 rounded-md gap-1.5 px-3 text-xs',
        lg:        'h-11 rounded-md px-6 text-base',
        icon:      'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  },
)

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>

/**
 * Core interactive button.
 *
 * Built on a native `<button>` element with CVA-driven variants.
 * No Radix UI dependency - no `asChild` prop (use a wrapping `<Link>` or `<a>` instead).
 *
 * @example
 * <Button>Submit</Button>
 * <Button variant="outline" size="sm">Cancel</Button>
 * <Button variant="ghost" size="icon"><X /></Button>
 */
export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
