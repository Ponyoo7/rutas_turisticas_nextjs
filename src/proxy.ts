import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  if (!authToken) return NextResponse.redirect(new URL('/login', request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/rutas/crear', '/perfil'],
}
