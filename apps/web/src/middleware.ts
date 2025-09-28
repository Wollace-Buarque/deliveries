import { NextResponse } from 'next/server'
import type { MiddlewareConfig, NextRequest } from 'next/server'

const publicRoutes = ['/login', '/register']

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = '/login'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const publicRoute = publicRoutes.includes(path)
  const authToken = request.cookies.get('token')?.value

  if (!authToken && publicRoute) return NextResponse.next()

  if (!authToken && !publicRoute) {
    const redirectUrl = request.nextUrl.clone()

    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE

    return NextResponse.redirect(redirectUrl)
  }

  if (authToken && publicRoute) {
    const redirectUrl = request.nextUrl.clone()

    redirectUrl.pathname = '/'

    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
}
