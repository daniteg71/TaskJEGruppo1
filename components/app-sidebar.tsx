'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Atom, Building2, LayoutGrid } from 'lucide-react'
import { Logo } from '@/components/brand'
import { setCompany } from '@/app/actions/company'
import { cn } from '@/lib/utils'

type Company = { id: string; name: string }

const links = [
  { href: '/', label: 'Bandi', icon: LayoutGrid },
  { href: '/dna', label: 'DNA Aziendale', icon: Atom },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname.startsWith('/bandi')
  return pathname === href || pathname.startsWith(href + '/')
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <>
      {links.map((l) => {
        const active = isActive(pathname, l.href)
        const Icon = l.icon
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{l.label}</span>
          </Link>
        )
      })}
    </>
  )
}

// Selettore azienda: cambia il DNA attivo (multi-azienda di test).
function CompanySwitcher({ companies, selectedId }: { companies: Company[]; selectedId: string | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  if (companies.length === 0) return null
  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-2.5 py-2">
      <Building2 className="size-4 shrink-0 text-accent" />
      <select
        value={selectedId ?? ''}
        disabled={isPending}
        onChange={(e) => {
          const id = e.target.value
          startTransition(async () => {
            await setCompany(id)
            router.refresh()
          })
        }}
        className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
      >
        {companies.map((c) => (
          <option key={c.id} value={c.id} className="bg-popover text-foreground">
            {c.name}
          </option>
        ))}
      </select>
    </label>
  )
}

export function AppSidebar({
  companies = [],
  selectedId = null,
}: {
  companyName?: string
  companies?: Company[]
  selectedId?: string | null
}) {
  const pathname = usePathname()

  return (
    <>
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-sidebar px-3 py-4 md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2 pb-4">
          <Logo size={28} />
          <span className="text-base font-semibold tracking-tight">ban4ban</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          <NavLinks pathname={pathname} />
        </nav>

        <CompanySwitcher companies={companies} selectedId={selectedId} />
      </aside>

      <header className="no-print sticky top-0 z-40 flex flex-col gap-2 border-b border-border bg-sidebar px-4 py-3 md:hidden">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={26} />
            <span className="text-sm font-semibold tracking-tight">ban4ban</span>
          </Link>
          <div className="flex items-center gap-1">
            <NavLinks pathname={pathname} />
          </div>
        </div>
        <CompanySwitcher companies={companies} selectedId={selectedId} />
      </header>
    </>
  )
}
