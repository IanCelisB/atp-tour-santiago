import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Header, type HeaderUser } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getSession } from '@/lib/auth/session';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ATP Tour Santiago',
  description:
    'Sitio oficial del ATP Tour Santiago: campeonatos, jugadores, brackets y timeline de partidos.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const user: HeaderUser | null =
    session.userId && session.email && session.role
      ? {
          email: session.email,
          role: session.role,
        }
      : null;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header user={user} />
        <div className="flex-1 pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
