import { Component, type ReactNode } from 'react'
import { StateIllustration } from './StateIllustration'

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <StateIllustration
          kind="error"
          action={
            <button
              onClick={() => window.location.reload()}
              className="shadow-press rounded-full border-2 border-ink bg-red px-5 py-2 text-sm font-bold text-white shadow-sm"
            >
              Reload page
            </button>
          }
        />
      )
    }
    return this.props.children
  }
}
