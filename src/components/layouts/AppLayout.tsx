import { Suspense } from 'react'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { logger } from '@/lib/logger'

interface AppLayoutProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Loading-Komponente für Suspense
function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

// Error-Fallback für ErrorBoundary
function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  logger.error('Layout error caught', { error: error.message })
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Layout-Fehler
        </h2>
        <p className="text-gray-600 mb-4">
          Es gab ein Problem beim Laden der Seite.
        </p>
        <button
          onClick={resetError}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  )
}

export default function AppLayout({ children, fallback = <LoadingSpinner /> }: AppLayoutProps) {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={fallback}>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </Suspense>
      </div>
    </ErrorBoundary>
  )
} 