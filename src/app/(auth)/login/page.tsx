import { getTranslations } from '@/shared/i18n/server'
import { Button } from '@/shared/components/ui/button'
import { IconArrowLeft } from '@tabler/icons-react'
import Image from 'next/image'
import Link from 'next/link'
import { LoginForm } from './components/LoginForm'

export default async function Page() {
  const { t } = await getTranslations()

  return (
    <>
      <div className="relative mb-8 h-[320px] w-full overflow-hidden rounded-2xl shadow-xl">
        <div className="absolute inset-0 z-20 flex flex-col justify-end bg-linear-to-t from-black/80 via-black/20 to-transparent p-8">
          <span className="mb-2 text-xs font-bold uppercase tracking-widest text-white/70">
            {t('common.appName')}
          </span>
          <h1 className="font-serif text-4xl font-black italic tracking-tight text-white">
            {t('auth.login.title')}
          </h1>
        </div>
        <Image
          src="/login_image.png"
          alt={t('auth.login.imageAlt')}
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          priority
        />
        <Button
          asChild
          className="absolute top-2 left-2 z-100 cursor-pointer bg-transparent hover:bg-neutral-500/40"
        >
          <Link href="/">
            <IconArrowLeft />
            <span>{t('common.back')}</span>
          </Link>
        </Button>
      </div>

      <div className="mb-6 w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <LoginForm />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('auth.login.noAccount')}{' '}
        <Link
          href="/register"
          className="font-bold text-artis-primary hover:underline"
        >
          {t('auth.login.cta')}
        </Link>
      </p>
    </>
  )
}
