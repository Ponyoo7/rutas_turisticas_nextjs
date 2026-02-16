import { cookies } from 'next/headers'
import './globals.css'
import { verifyToken } from '@/actions/user.actions'
import { UserProvider } from '@/shared/components/providers/UserProvider'
import { Manrope, Noto_Serif } from 'next/font/google'

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
})

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-serif',
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  return (
    <html lang="es">
      <body
        className={`antialiased h-screen w-screen ${manrope.variable} ${notoSerif.variable} font-sans`}
      >
        {children}
        <UserProvider user={verified} />
      </body>
    </html>
  )
}
