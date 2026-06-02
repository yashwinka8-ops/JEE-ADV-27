import type { Metadata } from 'next';
import './globals.css';
import TopNav from '@/components/TopNav';

export const metadata: Metadata = {
  title: 'JEE Advanced 2027 Tracker',
  description: 'Distraction-free study tracker for JEE Advanced 2027 preparation — track syllabus, timer, tests, and analytics.',
  keywords: ['JEE Advanced', 'JEE Tracker', 'Study Planner', 'JEE 2027'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      </head>
      <body>
        <div className="layout">
          <TopNav />
          <main className="main-content">
            <div className="main-container">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
