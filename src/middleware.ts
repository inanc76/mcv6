import { NextRequest, NextResponse } from 'next/server'

/**
 * Generic locale-aware middleware.
 *
 * LOCALES + DEFAULT_LOCALE env'den okunur. Her proje kendi .env'inde:
 *   PUBLIC_LOCALES=tr,en
 *   PUBLIC_DEFAULT_LOCALE=tr
 * Tek-dilli proje istiyorsan: PUBLIC_LOCALES=tr (tek değer) — redirect oluşmaz.
 */
const LOCALES = (process.env.PUBLIC_LOCALES || 'tr,en')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const DEFAULT_LOCALE = process.env.PUBLIC_DEFAULT_LOCALE || LOCALES[0]

export function middleware(req: NextRequest) {
  // Tek dilli — middleware bypass
  if (LOCALES.length <= 1) return NextResponse.next()

  const { pathname } = req.nextUrl

  // Skip admin, API, internal, static assets
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/next') ||
    pathname.startsWith('/_next') ||
    pathname.endsWith('-sitemap.xml') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.\w+$/)
  ) {
    return NextResponse.next()
  }

  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
  if (hasLocale) return NextResponse.next()

  const accept = req.headers.get('accept-language') || ''
  const detected = LOCALES.find((l) => accept.toLowerCase().includes(l)) || DEFAULT_LOCALE

  const target = pathname === '/' ? `/${detected}` : `/${detected}${pathname}`
  return NextResponse.redirect(new URL(target, req.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
