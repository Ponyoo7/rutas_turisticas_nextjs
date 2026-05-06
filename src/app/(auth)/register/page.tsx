import { RegisterForm } from '@/app/(auth)/register/components/RegisterForm'
import { getTranslations } from '@/shared/i18n/server'
import { Button } from '@/shared/components/ui/button'
import { IconArrowLeft } from '@tabler/icons-react'
import Image from 'next/image'
import Link from 'next/link'

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
            {t('auth.register.title')}
          </h1>
        </div>
        <Image
          src="/login_image.png"
          alt={t('auth.register.imageAlt')}
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

      <div className="mb-6 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="px-6 pt-8">
          <h2 className="border-b border-artis-primary/10 pb-3 font-serif text-2xl font-bold leading-tight tracking-tight text-artis-primary dark:text-white">
            {t('auth.register.heading')}
          </h2>
          <p className="border-b border-artis-primary/10 pb-6 text-sm leading-relaxed font-normal text-artis-primary/70 dark:text-zinc-400">
            {t('auth.register.description')}
          </p>
        </div>
        <div className="p-8">
          <RegisterForm />
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t('auth.register.alreadyHaveAccount')}{' '}
        <Link href="/login" className="font-bold text-artis-primary hover:underline">
          {t('auth.register.loginCta')}
        </Link>
      </p>
    </>
  )
}
