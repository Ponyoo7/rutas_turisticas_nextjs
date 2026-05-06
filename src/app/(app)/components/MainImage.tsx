import { getTranslations } from '@/shared/i18n/server'
import { Button } from '@/shared/components/ui/button'
import Link from 'next/link'

export const MainImage = async () => {
  const { t } = await getTranslations()

  return (
    <div className="p-0">
      <div className="relative flex min-h-[520px] flex-col items-start justify-end gap-6 overflow-hidden rounded-xl px-6 pb-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn-imgix.headout.com/media/images/66bb4cc2e114ddd6d0d9f99037768beb-Pantheon%20Rome%20The%20Altar%20of%20the%20Holy%20Spirit.jpg"
          alt={t('home.hero.imageAlt')}
          className="absolute inset-0 h-full w-full object-cover object-[center_14%] brightness-[0.76] saturate-[0.82] md:object-[center_18%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,12,8,0.56)_0%,rgba(17,12,8,0.24)_42%,rgba(17,12,8,0.58)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.72)_100%)]" />

        <div className="z-10 flex flex-col gap-3 text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-white/80">
            {t('home.hero.eyebrow')}
          </span>
          <h1 className="font-serif text-5xl font-black leading-[1.1] tracking-tight text-white">
            {t('home.hero.title')}
          </h1>
          <h2 className="max-w-[280px] text-base font-normal leading-relaxed text-white/90">
            {t('home.hero.description')}
          </h2>
        </div>
        <div className="z-10 mt-4 flex w-full flex-col gap-3 gap-y-3">
          <Button
            className="h-14 w-full border-none bg-artis-primary text-base font-bold text-white shadow-lg hover:bg-artis-primary/90"
            asChild
          >
            <Link href="/buscador">{t('home.hero.cta')}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
