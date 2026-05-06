/**
 * Página principal estática del directorio /rutas.
 * (En la versión actual sirve como un entry-point básico para Mis Rutas).
 */
export default async function Page() {
  const { t } = await getTranslations()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{t('profile.myRoutes.title')}</h1>
    </main>
  )
}
import { getTranslations } from '@/shared/i18n/server'
