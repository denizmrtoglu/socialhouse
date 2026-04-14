import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/login(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next()

  const { userId, sessionClaims } = await auth()

  // Giriş yapılmamışsa login'e yönlendir
  if (!userId) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role

  if (role !== 'admin') {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
