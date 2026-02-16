import { Navbar } from "@/shared/components/navbar/Navbar";
import { Sidebar } from "@/shared/components/sidebar/Sidebar";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-screen flex flex-col md:grid md:grid-cols-[auto_1fr] md:grid-rows-[auto_1fr] overflow-hidden">
            <Navbar />
            <div className="flex-1 overflow-auto md:row-start-2 md:col-start-2">
                {children}
            </div>
            <div className="md:row-start-2 md:col-start-1">
                <Sidebar />
            </div>
        </div>
    )
}