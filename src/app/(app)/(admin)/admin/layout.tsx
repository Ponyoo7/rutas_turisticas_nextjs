export default function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex max-w-7xl flex-col px-4 py-6 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  )
}
