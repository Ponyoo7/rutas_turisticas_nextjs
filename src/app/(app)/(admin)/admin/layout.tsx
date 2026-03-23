export default function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f1ea_0%,#fcfbf8_55%,#ffffff_100%)]">
      <main className="mx-auto flex max-w-7xl flex-col px-4 py-6 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  )
}
