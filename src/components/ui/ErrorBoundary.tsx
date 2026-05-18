import { Component, type ReactNode } from 'react'

interface Props {
  children:  ReactNode
  /** Optional custom fallback. Receives the error so you can display it. */
  fallback?: (error: Error) => ReactNode
}

interface State {
  error: Error | null
}

/**
 * Class-based error boundary.
 *
 * Catches any render-time or lifecycle errors in its subtree and shows
 * a recovery UI instead of an uncaught exception. Wrap individual routes
 * (or the whole app) with this component.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Replace with your error reporting service (Sentry, Datadog, etc.)
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleReset = () => this.setState({ error: null })

  override render() {
    const { error } = this.state

    if (error) {
      if (this.props.fallback) return this.props.fallback(error)

      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10">
            <span className="text-2xl">⚠</span>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Something went wrong</h2>
            <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-full border border-border/60 px-6 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
