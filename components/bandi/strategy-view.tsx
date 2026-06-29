'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Check,
  CheckSquare,
  Circle,
  Download,
  ExternalLink,
  ShieldAlert,
  Square,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ExecutionStrategy } from '@/lib/strategy'
import type { ChecklistItem, Recommendation, ScoreBreakdown, TodoCategory } from '@/lib/evaluate'

const DIM_LABELS: { key: keyof ScoreBreakdown; label: string }[] = [
  { key: 'sector_fit', label: 'Settore' },
  { key: 'technical_fit', label: 'Tecnica' },
  { key: 'certifications_fit', label: 'Certificazioni' },
  { key: 'experience_fit', label: 'Esperienza' },
  { key: 'geographic_fit', label: 'Geografia' },
  { key: 'economic_strategic_fit', label: 'Economico-strategico' },
]

const REC: Record<Recommendation, { label: string; cls: string; Icon: typeof ThumbsUp }> = {
  CANDIDARSI: { label: 'Candidarsi', cls: 'text-ok border-ok/40 bg-ok/10', Icon: ThumbsUp },
  VALUTARE_CON_ATTENZIONE: { label: 'Valutare con attenzione', cls: 'text-warn border-warn/40 bg-warn/10', Icon: AlertTriangle },
  NON_CANDIDARSI: { label: 'Non candidarsi', cls: 'text-muted-foreground border-border bg-secondary/40', Icon: ThumbsDown },
}

const CAT_ORDER: TodoCategory[] = ['AMMINISTRATIVA', 'DOCUMENTALE', 'TECNICA', 'FINANZIARIA']
const CAT_LABEL: Record<TodoCategory, string> = {
  AMMINISTRATIVA: 'Amministrativa',
  DOCUMENTALE: 'Documentale',
  TECNICA: 'Tecnica',
  FINANZIARIA: 'Finanziaria',
}
const PRIO_CLS: Record<ChecklistItem['priority'], string> = {
  ALTA: 'text-ok',
  MEDIA: 'text-warn',
  BASSA: 'text-muted-foreground',
}

function scoreColor(v: number): string {
  return v >= 7.5 ? 'text-ok' : v >= 5 ? 'text-warn' : 'text-muted-foreground'
}

export function StrategyView({ s }: { s: ExecutionStrategy }) {
  const e = s.evaluation
  const voto = s.score ?? 0
  const votoColor = scoreColor(voto)

  // Stato locale dei checkbox della checklist (gestione frontend; parte sempre da false).
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }))

  const rec = e ? REC[e.recommendation] : null

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
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {s.bando.url && (
              <a href={s.bando.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
                Pagina ufficiale <ExternalLink className="size-3.5" />
              </a>
            )}
            {rec && (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${rec.cls}`}>
                <rec.Icon className="size-3.5" /> {rec.label}
              </span>
            )}
            {e && (
              <span className="text-xs text-muted-foreground">Affidabilità analisi: {Math.round(e.confidence * 100)}%</span>
            )}
          </div>
        </header>

        {/* Sintesi */}
        {s.giustificazione && (
          <section className="mt-5">
            <h2 className="text-sm font-semibold">{e ? 'Sintesi della valutazione' : 'Perché questo voto'}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{s.giustificazione}</p>
          </section>
        )}

        {/* Punteggio per dimensione */}
        {e && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold">Punteggio per dimensione</h2>
            <div className="mt-2 flex flex-col gap-2">
              {DIM_LABELS.map(({ key, label }) => {
                const v = e.score_breakdown[key]
                return (
                  <div key={key} className="flex items-center gap-3 text-sm">
                    <span className="w-44 shrink-0 text-foreground/80">{label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary/60">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${v * 10}%`, printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
                      />
                    </div>
                    <span className={`w-8 shrink-0 text-right font-medium ${scoreColor(v)}`}>{v}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Punti di forza / debolezza */}
        {e && (e.strengths.length > 0 || e.weaknesses.length > 0) && (
          <section className="mt-6 grid gap-5 sm:grid-cols-2">
            {e.strengths.length > 0 && (
              <div>
                <h2 className="flex items-center gap-1.5 text-sm font-semibold"><ThumbsUp className="size-4 text-ok" /> Punti di forza</h2>
                <ul className="mt-2 flex flex-col gap-1 text-sm text-foreground/85">
                  {e.strengths.map((x, i) => <li key={i} className="flex gap-2"><span className="text-ok">+</span>{x}</li>)}
                </ul>
              </div>
            )}
            {e.weaknesses.length > 0 && (
              <div>
                <h2 className="flex items-center gap-1.5 text-sm font-semibold"><ThumbsDown className="size-4 text-warn" /> Punti deboli</h2>
                <ul className="mt-2 flex flex-col gap-1 text-sm text-foreground/85">
                  {e.weaknesses.map((x, i) => <li key={i} className="flex gap-2"><span className="text-warn">−</span>{x}</li>)}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Requisiti mancanti + Rischi */}
        {e && e.missing_requirements.length > 0 && (
          <section className="mt-6">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold"><ShieldAlert className="size-4 text-warn" /> Requisiti mancanti</h2>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-foreground/85">
              {e.missing_requirements.map((x, i) => <li key={i} className="flex gap-2"><span className="text-warn">•</span>{x}</li>)}
            </ul>
          </section>
        )}
        {e && e.risks.length > 0 && (
          <section className="mt-6">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold"><AlertTriangle className="size-4 text-warn" /> Rischi</h2>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-foreground/85">
              {e.risks.map((x, i) => <li key={i} className="flex gap-2"><span className="text-warn">•</span>{x}</li>)}
            </ul>
          </section>
        )}

        {/* Checklist operativa */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold">Checklist operativa per la candidatura</h2>
          {e && e.checklist.length > 0 ? (
            <div className="mt-2 flex flex-col gap-4">
              {CAT_ORDER.map((cat) => {
                const items = e.checklist.filter((c) => c.category === cat)
                if (items.length === 0) return null
                return (
                  <div key={cat}>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{CAT_LABEL[cat]}</h3>
                    <ul className="mt-1.5 flex flex-col gap-1.5">
                      {items.map((c) => (
                        <li key={c.id} className="flex items-start gap-2 text-sm">
                          <button onClick={() => toggle(c.id)} className="no-print mt-0.5 shrink-0" aria-label="segna come fatto">
                            {checked[c.id] ? <CheckSquare className="size-4 text-ok" /> : <Square className="size-4 text-muted-foreground" />}
                          </button>
                          <Square className="mt-0.5 hidden size-4 shrink-0 text-muted-foreground print:block" />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-x-2">
                              <span className={`font-medium ${checked[c.id] ? 'text-muted-foreground line-through' : ''}`}>{c.task}</span>
                              <span className={`text-[10px] font-semibold uppercase ${PRIO_CLS[c.priority]}`}>{c.priority}</span>
                            </div>
                            {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                            {c.suggested_timeline && <p className="text-xs text-accent">⏱ {c.suggested_timeline}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {s.checklist.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {c.fatto ? <Check className="mt-0.5 size-4 text-ok" /> : <Circle className="mt-0.5 size-4 text-muted-foreground" />}
                  <span className="flex-1">{c.voce}</span>
                  {c.responsabile && <span className="text-xs text-muted-foreground">{c.responsabile}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Prossime azioni (dall'analisi) */}
        {e && e.next_actions.length > 0 && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold">Prossime azioni</h2>
            <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-sm text-foreground/85">
              {e.next_actions.map((x, i) => <li key={i}>{x}</li>)}
            </ol>
          </section>
        )}

        {/* Tempistiche (scheletro standard, utile come piano di massima) */}
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

        <footer className="mt-8 border-t border-border pt-3 text-xs text-muted-foreground">
          Analisi generata il {new Date(s.generatedAt).toLocaleString('it-IT')} · {s.azienda.nome}
          {!e && ' · valutazione rapida (analisi dettagliata AI non disponibile)'}
        </footer>
      </div>
    </div>
  )
}
