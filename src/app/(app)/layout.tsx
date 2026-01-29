import { Sidebar } from "@/shared/components/sidebar/Sidebar";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-full grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] overflow-hidden">
            <nav className="col-span-2 h-18 border-b p-4">nav</nav>
            <Sidebar />
            <div className="w-full h-full overflow-auto">{children}</div>
        </div>
    )
}