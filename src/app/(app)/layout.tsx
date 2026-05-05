import { Navbar } from '@/shared/components/navbar/Navbar'
import { Sidebar } from '@/shared/components/sidebar/Sidebar'

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-screen min-h-0 flex flex-col overflow-hidden md:grid md:grid-cols-[auto_1fr] md:grid-rows-[auto_1fr]">
            <Navbar />
            <div
                data-app-scroll-container
                className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain md:row-start-2 md:col-start-2"
            >
                {children}
            </div>
            <div className="min-h-0 md:row-start-2 md:col-start-1">
                <Sidebar />
            </div>
        </div>
    )
}
