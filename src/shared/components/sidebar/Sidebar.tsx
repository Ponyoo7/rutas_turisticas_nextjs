import Link from "next/link"

const menuItems = [
    {
        label: 'Explora',
        href: '/'
    },
    {
        label: 'Rutas',
        href: '/rutas'
    },
]

export const Sidebar = () => {
    return (
        <aside className="w-62 border-r p-4 flex flex-col">{
            menuItems.map(m => (
                <Link key={m.label} href={m.href}>{m.label}</Link>
            ))
        }</aside>
    )
}