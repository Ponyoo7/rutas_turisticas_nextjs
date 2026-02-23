import { IconLoader2 } from '@tabler/icons-react'

/**
 * Interfaz de carga mostrada por Next.js antes de resolver y renderizar la página y sus componentes (Suspense/Server Components).
 */
export default function Loading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <IconLoader2 size={72} className="animate animate-spin" />
    </div>
  )
}
