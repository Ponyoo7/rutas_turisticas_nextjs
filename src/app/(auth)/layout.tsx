/**
 * Renderiza el diseño base para las páginas de autenticación (Login / Registro).
 * Mantiene un diseño centrado y limpio con estilos base adaptables.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-artis-background-light dark:bg-artis-background-dark">
      <main className="flex-1 p-6 md:p-12 flex flex-col justify-center">
        <div className="w-full max-w-[700px] mx-auto flex flex-col items-center">
          {children}
        </div>
      </main>
    </div>
  )
}
