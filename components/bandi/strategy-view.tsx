'use client'

import { Check, Circle, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ExecutionStrategy } from '@/lib/strategy'

export function StrategyView({ s }: { s: ExecutionStrategy }) {
  const voto = s.score ?? 0
  const votoColor = voto >= 7.5 ? 'text-ok' : voto >= 5 ? 'text-warn' : 'text-muted-foreground'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="no-print mb-4 flex items-center justify-between">
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground">← Torna ai bandi</a>
        <Button onClick={() => window.print()} size="sm">
          <Download className="size-4" /> Scarica PDF
        </Button>
      </div>

      <div className="strategy-sheet glass rounded-xl p-8">
        <header className="border-b border-border pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Badge variant="secondary">{s.bando.fonte}</Badge>
              <h1 className="mt-2 text-2xl font-semibold leading-tight">{s.bando.titolo}</h1>
            </div>
            {s.score != null && (
              <div className="flex shrink-0 items-baseline gap-1">
                <span className={`text-4xl font-bold ${votoColor}`}>{voto.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">/10</span>
              </div>
            )}
          </div>
          {s.bando.url && (
            <a href={s.bando.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline">
              Pagina ufficiale <ExternalLink className="size-3.5" />
            </a>
          )}
        </header>

        {/* Perché questo voto */}
        {s.giustificazione && (
          <section className="mt-5">
            <h2 className="text-sm font-semibold">Perché questo voto</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{s.giustificazione}</p>
          </section>
        )}

        {/* Checklist */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold">Cosa fare per partecipare</h2>
          <ul className="mt-2 flex flex-col gap-1.5">
            {s.checklist.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {c.fatto ? <Check className="mt-0.5 size-4 text-ok" /> : <Circle className="mt-0.5 size-4 text-muted-foreground" />}
                <span className="flex-1">{c.voce}</span>
                {c.responsabile && <span className="text-xs text-muted-foreground">{c.responsabile}</span>}
              </li>
            ))}
          </ul>
        </section>

        {/* Piano */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold">Tempistiche</h2>
          <ol className="mt-2 flex flex-col gap-1.5">
            {s.milestone.map((m, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-24 shrink-0 font-medium text-accent">{m.quando}</span>
                <span className="text-foreground/85">{m.cosa}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
