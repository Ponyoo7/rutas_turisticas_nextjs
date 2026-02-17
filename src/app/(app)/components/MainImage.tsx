import { Button } from '@/shared/components/ui/button'
import Link from 'next/link'

export const MainImage = () => {
  return (
    <div className="p-0">
      <div
        className="relative flex min-h-[520px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-start justify-end px-6 pb-12 rounded-xl overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.0) 0%, rgba(0, 0, 0, 0.7) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBQyjntHkICpekAMqN8s8XMmmviN8OoAeiAZ9j5X4jzgEDiksJxQuXlxsDIw25C0t3rDpFELMrxN-J22BGfZEMLIqVmYSDI9z958baMWxTMy4tZfVWLR75S9FAVWJCd609JXFHfe38GqYe400lJ11fDqHYwGT0mFKPYt9N46pTg0i4TzmY86VMLkc7zqlQF9tOdutGLOMs85FLgVof_LaZQlJKZPby5QweL8_tpWVCqS3ef7ZewZpBtJaTnJcMfG6HCSL0Ph47zgoNJ")',
        }}
      >
        <div className="flex flex-col gap-3 text-left z-10">
          <span className="text-white/80 uppercase tracking-widest text-xs font-bold">
            El arte de viajar
          </span>
          <h1 className="text-white text-5xl font-black leading-[1.1] tracking-tight font-serif">
            Camina a través de la historia.
          </h1>
          <h2 className="text-white/90 text-base font-normal leading-relaxed max-w-[280px]">
            Descubre el alma de las ciudades a través de la mirada del arte y el
            tiempo.
          </h2>
        </div>
        <div className="flex flex-col w-full gap-3 mt-4 z-10 gap-y-3">
          <Button
            className="w-full h-14 bg-artis-primary text-white hover:bg-artis-primary/90 text-base font-bold shadow-lg border-none"
            asChild
          >
            <Link href="/buscador">Crear mi ruta cultural</Link>
          </Button>

          {/* <Button
            variant="outline"
            className="w-full h-14 bg-white/10 backdrop-blur-md border-white/30 text-white text-base font-bold hover:bg-white/20 hover:text-white border"
            asChild
          >
            <Link href="/rutas">Explore routes</Link>
          </Button> */}
        </div>
      </div>
    </div>
  )
}
