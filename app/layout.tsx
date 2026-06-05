import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import AuthGuard from '@/components/AuthGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JEE Advanced 2027 Tracker',
  description: 'Distraction-free study tracker for JEE Advanced 2027 preparation — track syllabus, timer, tests, and analytics.',
  keywords: ['JEE Advanced', 'JEE Tracker', 'Study Planner', 'JEE 2027'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      </head>
      <body className={inter.className} style={{ background: '#0a0a0a', color: '#f5f5f5' }}>
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
