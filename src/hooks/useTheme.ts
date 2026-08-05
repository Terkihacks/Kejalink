import { useState, useEffect, useCallback } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'keja-theme'

/**
 * Manages the app colour theme - dark (default) or light.
 *
 * Strategy:
 *  - Dark is the default. The `:root` CSS tokens define the dark palette.
 *  - Light mode is activated by adding the `.light` class to `<html>`,
 *    which triggers `html.light` overrides in `src/styles/index.css`.
 *  - Preference is persisted to `localStorage` under `"keja-theme"`.
 *  - On first visit, falls back to the OS `prefers-color-scheme` setting.
 *
 * A blocking inline `<script>` in `index.html` applies the saved class before
 * React hydrates, preventing a flash of the wrong theme.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
