import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarClock,
  Check,
  CircleDot,
  Euro,
  ExternalLink,
  MapPin,
  Target,
  TriangleAlert,
} from 'lucide-react'
import { ensureStrategy, getCurrentCompany, getGrantById } from '@/app/actions/company'
import { AppNav } from '@/components/app-nav'
import { MatchRing } from '@/components/dashboard/match-ring'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function GrantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const grantId = Number.parseInt(id, 10)
  if (!Number.isFinite(grantId)) notFound()

  const company = await getCurrentCompany()
  if (!company) redirect('/')

  const grant = await getGrantById(grantId)
  if (!grant) notFound()

  const strategy = await ensureStrategy(grantId)

  function probLabel(p: number) {
    if (p >= 70) return 'Alta'
    if (p >= 45) return 'Media'
    return 'Bassa'
  }

  return (
    <main className="aurora-bg min-h-screen pb-16">
      <AppNav companyName={company.name} />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Tutti i bandi
        </Link>

        {/* Header */}
        <div className="glass-strong rounded-3xl p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <MatchRing score={grant.matchScore ?? 0} size={92} label="coerenza" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {grant.category && (
                  <Badge className="bg-primary/20 text-foreground hover:bg-primary/20">
                    {grant.category}
                  </Badge>
                )}
                {grant.region && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="size-3" />
                    {grant.region}
                  </Badge>
                )}
                {grant.sourceName && (
                  <Badge variant="secondary">{grant.sourceName}</Badge>
                )}
              </div>
              <h1 className="mt-2 text-balance text-2xl font-semibold leading-tight tracking-tight">
                {grant.title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {grant.description}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Euro className="size-4 text-ok" />
              <span className="text-muted-foreground">Contributo:</span>
              <span className="font-medium">{grant.amount}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-4 text-warn" />
              <span className="text-muted-foreground">Scadenza:</span>
              <span className="font-medium">{grant.deadline}</span>
            </span>
            {grant.sourceUrl && (
              <a
                href={grant.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto"
              >
                <Button variant="outline" size="sm" className="bg-transparent">
                  <ExternalLink className="size-4" />
                  Apri fonte
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Strategy */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Probability card */}
          <div className="glass rounded-2xl p-5 lg:col-span-1">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Target className="size-4 text-accent" />
              Probabilità di accesso
            </div>
            <div className="mt-4 flex flex-col items-center">
              <MatchRing score={strategy.probability} size={120} label="" />
              <span className="mt-3 text-sm font-medium">
                Probabilità {probLabel(strategy.probability)}
              </span>
              <span className="mt-1 text-center text-xs text-muted-foreground">
                Stima basata sul DNA di {company.name}
              </span>
            </div>
            <div className="mt-4 rounded-xl bg-secondary/40 p-3">
              <p className="text-xs leading-relaxed text-foreground/80">
                {strategy.recommendedTimeline}
              </p>
            </div>
          </div>

          {/* Summary + fit + risks */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="glass rounded-2xl p-5">
              <h2 className="text-sm font-semibold">Strategia consigliata</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                {strategy.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="glass rounded-2xl p-5">
                <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ok">
                  <Check className="size-4" /> Perché è coerente
                </div>
                <ul className="flex flex-col gap-2">
                  {strategy.fitReasons.map((r, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-xs leading-relaxed text-foreground/80"
                    >
                      <CircleDot className="mt-0.5 size-3 shrink-0 text-ok" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-warn">
                  <TriangleAlert className="size-4" /> Rischi e attenzioni
                </div>
                <ul className="flex flex-col gap-2">
                  {strategy.risks.map((r, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-xs leading-relaxed text-foreground/80"
                    >
                      <CircleDot className="mt-0.5 size-3 shrink-0 text-warn" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="glass mt-4 rounded-2xl p-6">
          <h2 className="text-sm font-semibold">Piano operativo</h2>
          <ol className="mt-4 flex flex-col gap-3">
            {strategy.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-foreground">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-foreground/85">
                  {s}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  )
}
