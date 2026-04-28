interface Props {
  name: string
}

export const CityHeaderSkeleton = ({ name }: Props) => {
  return (
    <div className="relative flex min-h-[320px] flex-col items-center justify-center gap-8 rounded-xl bg-[linear-gradient(135deg,#d6c3a6_0%,#8f6c3b_45%,#4b3923_100%)] px-6 pb-12 text-center">
      <div className="absolute inset-0 rounded-xl bg-black/25" />
      <div className="z-10 flex max-w-3xl flex-col gap-3">
        <div className="mx-auto h-5 w-28 animate-pulse rounded-full bg-white/25" />
        <h1 className="font-serif text-5xl font-black leading-[1.1] tracking-tight text-white drop-shadow-lg capitalize md:text-6xl">
          {name}
        </h1>
      </div>

      <div className="z-10 mt-6 h-14 w-64 animate-pulse rounded-full bg-white/20" />
    </div>
  )
}
