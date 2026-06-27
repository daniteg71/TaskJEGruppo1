'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Atom, Home } from 'lucide-react'
import { Logo } from '@/components/brand'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Home · Bandi', icon: Home },
  { href: '/dna', label: 'DNA Aziendale', icon: Atom },
]

export function AppNav({ companyName }: { companyName: string }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="glass-strong mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="hidden text-sm font-semibold tracking-tight sm:block">
            Jesap
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(l.href + '/')
            const Icon = l.icon
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/20 text-foreground'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-1.5">
          <span className="size-2 rounded-full bg-ok" />
          <span className="max-w-[140px] truncate text-sm font-medium">
            {companyName}
          </span>
        </div>
      </div>
    </header>
  )
}
