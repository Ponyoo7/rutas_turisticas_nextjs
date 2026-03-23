import Link from 'next/link'

interface Props {
  href: string
  title: string
  description: string
  value: string
  note: string
}

export const AdminSectionCard = ({
  href,
  title,
  description,
  value,
  note,
}: Props) => {
  return (
    <Link
      href={href}
      className="group rounded-[28px] border border-artis-primary/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <span className="text-xs font-bold uppercase tracking-[0.35em] text-artis-primary/50">
        {value}
      </span>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-artis-primary">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">{description}</p>
        </div>

        <span className="rounded-full border border-artis-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-artis-primary transition-colors group-hover:bg-artis-primary group-hover:text-white">
          Abrir
        </span>
      </div>

      <p className="mt-6 text-xs font-medium text-gray-500">{note}</p>
    </Link>
  )
}
