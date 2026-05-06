import { cookies } from 'next/headers'
import './globals.css'
import { verifyToken } from '@/actions/user.actions'
import { UserProvider } from '@/shared/components/providers/UserProvider'
import { I18nProvider } from '@/shared/i18n/I18nProvider'
import { getTranslations } from '@/shared/i18n/server'
import { Manrope, Noto_Serif } from 'next/font/google'
import { Metadata } from 'next'

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

export const metadata: Metadata = {
  title: 'Route Craft',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')
  const { locale, messages } = await getTranslations()

  const verified = await verifyToken(authToken?.value)

  return (
    <html lang={locale}>
      <body
        className={`antialiased h-screen w-screen ${manrope.variable} ${notoSerif.variable} font-sans`}
      >
        <I18nProvider locale={locale} messages={messages}>
          {children}
          <UserProvider user={verified} />
        </I18nProvider>
      </body>
    </html>
  )
}
