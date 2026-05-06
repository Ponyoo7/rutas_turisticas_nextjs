import { LanguageSwitcher } from '@/shared/components/language/LanguageSwitcher'

/**
 * Renderiza el diseno base para las paginas de autenticacion (Login / Registro).
 * Mantiene un diseno centrado y limpio con estilos base adaptables.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-artis-background-light dark:bg-artis-background-dark md:flex-row">
      <main className="flex flex-1 flex-col justify-center p-6 md:p-12">
        <div className="mb-6 flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="mx-auto flex w-full max-w-[700px] flex-col items-center">
          {children}
        </div>
      </main>
    </div>
  )
}
