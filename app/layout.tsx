import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';

// Font identità JESAP (come nel CRM: crm.jesap.it / JesapIt/Jesap-CRM)
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bandi × DNA',
  description: 'Valutazione di fattibilità e convenienza dei bandi pubblici rispetto al DNA aziendale.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={inter.variable}>
      <body>
        <header className="no-print border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-brand-gradient text-white grid place-items-center font-bold">J</div>
              <div>
                <div className="font-semibold leading-tight">Bandi × DNA</div>
                <div className="text-xs text-slate-500">Valutazione automatica MVP</div>
              </div>
            </Link>
            <nav className="text-sm text-slate-600 flex gap-4">
              <Link href="/" className="hover:text-brand">Dashboard</Link>
              <Link href="/dna" className="hover:text-brand">DNA</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
