import Image from 'next/image'
import { LoginForm } from './components/LoginForm'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'

export default function Page() {
  return (
    <>
      <div className="relative w-full h-[320px] mb-8 overflow-hidden rounded-2xl shadow-xl">
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 bg-linear-to-t from-black/80 via-black/20 to-transparent">
          <span className="text-white/70 uppercase tracking-widest text-xs font-bold mb-2">
            Route Craft
          </span>
          <h1 className="text-white text-4xl font-black tracking-tight font-serif italic">
            Inicio de Sesión
          </h1>
        </div>
        <Image
          src="/login_image.png"
          alt="Login representativo"
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          priority
        />
        <Button asChild className='z-100 absolute top-2 left-2 bg-transparent hover:bg-neutral-500/40 cursor-pointer'>
          <Link href='/'>
            <IconArrowLeft />
            <span>Volver</span>
          </Link>
        </Button>
      </div>

      <div className="w-full bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 mb-6">
        <LoginForm />
      </div>

      <p className="text-gray-500 dark:text-gray-400 text-sm">
        ¿Aún no estás registrado?{' '}
        <Link
          href="/register"
          className="text-artis-primary font-bold hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </>
  )
}
