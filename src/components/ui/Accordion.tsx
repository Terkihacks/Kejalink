'use client'

import { useState, useCallback, useContext, createContext, type ReactNode } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Accordion root context ──────────────────────────────────────── */

interface AccordionCtx {
  openItems: string[]
  toggle: (value: string) => void
}

const AccordionContext = createContext<AccordionCtx>({ openItems: [], toggle: () => {} })

/* ─── Item context ────────────────────────────────────────────────── */

interface ItemCtx {
  value: string
  isOpen: boolean
}

const ItemContext = createContext<ItemCtx>({ value: '', isOpen: false })

/* ─── Accordion root ──────────────────────────────────────────────── */

interface AccordionProps {
  /** "single" allows at most one open panel; "multiple" allows many */
  type?: 'single' | 'multiple'
  /** When true and type="single", clicking the open item closes it */
  collapsible?: boolean
  defaultValue?: string
  className?: string
  children: ReactNode
}

/**
 * Unstyled accordion root.
 *
 * Zero Radix UI dependency — implemented with React context + `useState`.
 * Smooth height animation is achieved with the CSS `grid-template-rows` trick,
 * which requires no JS height measurement.
 *
 * @example
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Question</AccordionTrigger>
 *     <AccordionContent>Answer</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
export function Accordion({
  type = 'single',
  collapsible = false,
  defaultValue,
  className,
  children,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(
    defaultValue ? [defaultValue] : [],
  )

  const toggle = useCallback(
    (value: string) => {
      setOpenItems(prev => {
        if (type === 'single') {
          if (prev.includes(value)) return collapsible ? [] : prev
          return [value]
        }
        return prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev, value]
      })
    },
    [type, collapsible],
  )

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div data-slot="accordion" className={cn('w-full', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

/* ─── AccordionItem ───────────────────────────────────────────────── */

interface AccordionItemProps {
  value: string
  className?: string
  children: ReactNode
}

/** Wraps a trigger + content pair and provides the open/close context to both */
export function AccordionItem({ value, className, children }: AccordionItemProps) {
  const { openItems } = useContext(AccordionContext)
  const isOpen = openItems.includes(value)

  return (
    <ItemContext.Provider value={{ value, isOpen }}>
      <div
        data-slot="accordion-item"
        className={cn('border-b last:border-b-0', className)}
      >
        {children}
      </div>
    </ItemContext.Provider>
  )
}

/* ─── AccordionTrigger ────────────────────────────────────────────── */

interface AccordionTriggerProps {
  className?: string
  children: ReactNode
}

/** Button that toggles the associated `AccordionContent` panel */
export function AccordionTrigger({ className, children }: AccordionTriggerProps) {
  const { toggle }  = useContext(AccordionContext)
  const { value, isOpen } = useContext(ItemContext)

  return (
    <button
      data-slot="accordion-trigger"
      type="button"
      onClick={() => toggle(value)}
      aria-expanded={isOpen}
      className={cn(
        'flex w-full items-start justify-between gap-4 py-4 text-left text-sm font-medium',
        'transition-all rounded-sm',
        'hover:text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      {children}
      <ChevronDownIcon
        className={cn(
          'text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5',
          'transition-transform duration-200',
          isOpen && 'rotate-180 text-primary',
        )}
      />
    </button>
  )
}

/* ─── AccordionContent ────────────────────────────────────────────── */

interface AccordionContentProps {
  className?: string
  children: ReactNode
}

/**
 * Collapsible content panel.
 *
 * Uses the CSS `grid-template-rows: 0fr ↔ 1fr` technique for smooth height
 * animation without any JavaScript measurement. This avoids the layout-thrash
 * that `scrollHeight` polling causes in Radix/other implementations.
 */
export function AccordionContent({ className, children }: AccordionContentProps) {
  const { isOpen } = useContext(ItemContext)

  return (
    <div
      data-slot="accordion-content"
      className="grid transition-[grid-template-rows] duration-200 ease-in-out"
      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
    >
      <div className="overflow-hidden">
        <div className={cn('pb-4 text-sm', className)}>{children}</div>
      </div>
    </div>
  )
}
