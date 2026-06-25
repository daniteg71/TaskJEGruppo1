'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CalendarClock,
  Clock,
  Euro,
  History,
  Loader2,
  MapPin,
  Radar,
  Search,
} from 'lucide-react'
import { searchGrants } from '@/app/actions/company'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MatchRing } from '@/components/dashboard/match-ring'
import type { Grant } from '@/lib/db/schema'

type HistoryItem = { id: number; at: string; found: number; scraped: number }

const STEPS = [
  'Connessione alle fonti web…',
  'Scansione bandi e incentivi…',
  'Confronto con il DNA aziendale…',
  'Calcolo del punteggio di coerenza…',
]

export function GrantsDashboard({
  grants,
  history = [],
  activeRunId,
}: {
  grants: Grant[]
  history?: HistoryItem[]
  activeRunId?: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(0)
  const [info, setInfo] = useState<string | null>(null)

  function runSearch() {
    setInfo(null)
    setStep(0)
    const interval = setInterval(
      () => setStep((s) => (s < STEPS.length - 1 ? s + 1 : s)),
      1400,
    )
    startTransition(async () => {
      try {
        const res = await searchGrants()
        setInfo(
          res.found > 0
            ? `${res.found} bandi rilevanti trovati (su ${res.scraped} risultati analizzati dal web).`
            : 'Nessun bando rilevante trovato in questo momento. Riprova tra poco.',
        )
        router.refresh()
      } catch {
        setInfo('Si è verificato un errore durante la ricerca. Riprova.')
      } finally {
        clearInterval(interval)
      }
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header / search */}
        <div className="glass-strong flex flex-col items-start justify-between gap-4 rounded-3xl p-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Radar className="size-6 text-accent" />
              Bandi per la tua azienda
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Scraping in tempo reale dal portale incentivi MIMIT, ordinato per
              coerenza con il tuo DNA aziendale.
            </p>
          </div>
          <Button size="lg" onClick={runSearch} disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            {grants.length > 0 ? 'Nuova ricerca' : 'Cerca bandi'}
          </Button>
        </div>

        {/* Storico ricerche */}
        {history.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <History className="size-4 text-accent" />
              Storico ricerche
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => {
                const isActive = activeRunId ? activeRunId === h.id : i === 0
                return (
                  <Link
                    key={h.id}
                    href={i === 0 ? '/dashboard' : `/dashboard?run=${h.id}`}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-colors ${
                      isActive
                        ? 'border-primary/50 bg-primary/20 text-foreground'
                        : 'border-border bg-secondary/40 text-muted-foreground hover:bg-primary/10'
                    }`}
                  >
                    <Clock className="size-3.5" />
                    <span>
                      {new Date(h.at).toLocaleString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="rounded-full bg-background/50 px-1.5 py-0.5 font-medium">
                      {h.found} bandi
                    </span>
                    {i === 0 && <span className="text-accent">· ultima</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isPending && (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="size-5 animate-spin text-accent" />
              <p className="text-sm font-medium">{STEPS[step]}</p>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {info && !isPending && (
          <p className="text-sm text-muted-foreground">{info}</p>
        )}

        {/* Empty state */}
        {!isPending && grants.length === 0 && (
          <div className="glass flex flex-col items-center justify-center rounded-3xl px-6 py-16 text-center">
            <div className="rounded-2xl border border-border bg-primary/10 p-4">
              <Radar className="size-8 text-accent" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">
              Avvia la prima ricerca
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Faremo lo scraping del web per trovare bandi, incentivi e
              contributi adatti al profilo della tua azienda.
            </p>
          </div>
        )}

        {/* Results grid */}
        {!isPending && grants.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {grants.map((g) => (
              <Link
                key={g.id}
                href={`/dashboard/${g.id}`}
                className="group glass rounded-2xl p-5 transition-all hover:border-primary/40 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <MatchRing score={g.matchScore ?? 0} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {g.category && (
                        <Badge className="bg-primary/20 text-foreground hover:bg-primary/20">
                          {g.category}
                        </Badge>
                      )}
                      {g.region && (
                        <Badge variant="secondary" className="gap-1">
                          <MapPin className="size-3" />
                          {g.region}
                        </Badge>
                      )}
                    </div>
                    <h3 className="mt-2 text-pretty text-base font-semibold leading-snug">
                      {g.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {g.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Euro className="size-3.5 text-ok" />
                    {g.amount}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarClock className="size-3.5 text-warn" />
                    {g.deadline}
                  </span>
                  <span className="ml-auto flex items-center gap-1 font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    Strategia
                    <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
