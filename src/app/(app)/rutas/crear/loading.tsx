import { IconLoader2 } from '@tabler/icons-react'

/**
 * Spinner de carga genérica para pantallas dependientes del directorio `crear`.
 */
export default function Loading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <IconLoader2 size={72} className="animate animate-spin" />
    </div>
  )
}
