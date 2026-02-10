import { cookies } from "next/headers";
import "./globals.css";
import { verifyToken } from "@/actions/user.actions";
import { UserProvider } from "@/shared/components/providers/UserProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth')

  const verified = await verifyToken(authToken?.value)

  return (
    <html lang="es">
      <body
        className={`antialiased h-screen w-screen`}
      >
        {children}
        <UserProvider user={verified} />
      </body>
    </html>
  );
}
