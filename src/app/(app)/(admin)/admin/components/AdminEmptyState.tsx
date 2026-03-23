interface Props {
  title: string
  description: string
}

export const AdminEmptyState = ({ title, description }: Props) => {
  return (
    <div className="rounded-[28px] border border-dashed border-artis-primary/20 bg-white/80 px-6 py-12 text-center shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/45">
        Panel admin
      </p>
      <h2 className="mt-4 font-serif text-3xl font-bold text-artis-primary">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
        {description}
      </p>
    </div>
  )
}
