import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fahndungssystem',
  description: 'Professionelles Fahndungssystem für Straftäter, Vermisste, unbekannte Tote und Sachen',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-gray-50`}>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Fahndungssystem
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Startseite
              </Link>
              <Link href="/fahndung" className="text-gray-700 hover:text-gray-900">
                Fahndungen
              </Link>
              <Link href="/service" className="text-gray-700 hover:text-gray-900">
                Service
              </Link>
              <Link href="/polizei" className="text-gray-700 hover:text-gray-900">
                Polizei
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Fahndungssystem. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 