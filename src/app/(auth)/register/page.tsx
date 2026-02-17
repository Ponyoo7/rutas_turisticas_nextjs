import { RegisterForm } from '@/app/(auth)/register/components/RegisterForm'
import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
  return (
    <>
      <div className="relative w-full h-[320px] mb-8 overflow-hidden rounded-2xl shadow-xl">
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 bg-linear-to-t from-black/80 via-black/20 to-transparent">
          <span className="text-white/70 uppercase tracking-widest text-xs font-bold mb-2">
            Artis Platform
          </span>
          <h1 className="text-white text-4xl font-black tracking-tight font-serif italic">
            Registro
          </h1>
        </div>
        <Image
          src="/login_image.png"
          alt="Register representativo"
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          priority
        />
      </div>

      <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 mb-6 overflow-hidden">
        <div className="px-6 pt-8">
          <h2 className="text-artis-primary dark:text-white font-serif tracking-tight text-2xl font-bold leading-tight pb-3">
            Conviértete en miembro
          </h2>
          <p className="text-artis-primary/70 dark:text-zinc-400 text-sm font-normal leading-relaxed pb-6 border-b border-artis-primary/10">
            Introduce tus datos para explorar ciudades a través del prisma de la
            historia del arte y una investigación académica especializada. Tu
            viaje por la narrativa cultural comienza aquí.
          </p>
        </div>
        <div className="p-8">
          <RegisterForm />
        </div>
      </div>

      <p className="text-gray-500 dark:text-gray-400 text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="text-artis-primary font-bold hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </>
  )
}
