import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`antialiased h-screen w-screen`}
      >
        {children}
      </body>
    </html>
  );
}
