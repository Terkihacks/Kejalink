import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks'
import { cn } from '@/lib/utils'

/**
 * Icon button that toggles between dark and light theme.
 *
 * Renders a Sun icon in dark mode ("switch to light") and a
 * Moon icon in light mode ("switch to dark").
 * Uses the `useTheme` hook which persists preference to localStorage.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg',
        'text-foreground/70 transition-colors',
        'hover:bg-muted/60 hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className,
      )}
    >
      {theme === 'dark'
        ? <Sun  className="h-4 w-4" strokeWidth={1.5} />
        : <Moon className="h-4 w-4" strokeWidth={1.5} />
      }
    </button>
  )
}
