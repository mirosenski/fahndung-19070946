import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'

// Geschützte Routen
const protectedRoutes = ['/admin', '/dashboard', '/profile']
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()
    
    // Supabase Client für Server-Side erstellen
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Session prüfen
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      logger.error('Auth error in middleware', { error: error.message })
    }

    const { pathname } = request.nextUrl

    // Admin-Routen schützen
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!session) {
        logger.security('Unauthorized access attempt to admin route', { pathname })
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Admin-Rolle prüfen (hier müsste man die User-Rolle aus der DB abfragen)
      // const { data: user } = await supabase
      //   .from('users')
      //   .select('role')
      //   .eq('id', session.user.id)
      //   .single()
      
      // if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      //   logger.security('Non-admin access attempt', { pathname, userId: session.user.id })
      //   return NextResponse.redirect(new URL('/', request.url))
      // }
    }

    // Geschützte Routen prüfen
    if (protectedRoutes.some(route => pathname.startsWith(route)) && !session) {
      logger.security('Unauthorized access attempt', { pathname })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Login/Register-Seiten umleiten wenn bereits eingeloggt
    if (session && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch (error) {
    logger.error('Middleware error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 