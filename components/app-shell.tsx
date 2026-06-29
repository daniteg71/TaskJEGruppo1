import type { ReactNode } from 'react'
import { AppSidebar } from '@/components/app-sidebar'

type Company = { id: string; name: string }

/**
 * Layout applicativo: sidebar fissa a sinistra (desktop) + area contenuti.
 * `noPadding` per pagine a tutta superficie (es. mappa DNA).
 */
export function AppShell({
  companyName,
  companies = [],
  selectedId = null,
  children,
  noPadding = false,
}: {
  companyName: string
  companies?: Company[]
  selectedId?: string | null
  children: ReactNode
  noPadding?: boolean
}) {
  return (
    <div className="min-h-screen bg-background md:pl-60">
      <AppSidebar companyName={companyName} companies={companies} selectedId={selectedId} />
      <main className={noPadding ? 'min-h-screen' : 'mx-auto max-w-5xl px-4 py-8 sm:px-6'}>
        {children}
      </main>
    </div>
  )
}
