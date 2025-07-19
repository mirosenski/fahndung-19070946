import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(_request: NextRequest) {
  // Einfache Middleware für Supabase Auth
  // Session-Handling wird in den Komponenten gemacht
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 