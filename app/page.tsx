import Link from 'next/link'
import { ArrowRight, Atom, Check, FileText, FolderOpen, Search, TriangleAlert } from 'lucide-react'
import { AppNav } from '@/components/app-nav'
import { Button } from '@/components/ui/button'
import { getCompanyInfo } from '@/app/actions/company'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { company, drive } = await getCompanyInfo()

  return (
    <main className="aurora-bg min-h-screen pb-16">
      <AppNav companyName={company.name} />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Bandi e incentivi per <span className="text-accent">{company.name}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          La piattaforma legge i documenti aziendali dal Drive, cerca i bandi dai portali ufficiali
          e mostra quelli compatibili con il profilo dell’azienda.
        </p>

        {/* Stato connessione Drive (reale) */}
        <div className="glass-strong mt-8 rounded-3xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <FolderOpen className="size-5 text-accent" />
              </div>
              <div>
                <h2 className="font-semibold">Cartella Google Drive</h2>
                <a
                  href={company.driveFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {company.driveFolderId}
                </a>
              </div>
            </div>
            {drive.connected ? (
              <span className="flex items-center gap-1.5 rounded-full bg-ok/15 px-3 py-1 text-sm font-medium text-ok">
                <Check className="size-4" /> Connesso
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-warn/15 px-3 py-1 text-sm font-medium text-warn">
                <TriangleAlert className="size-4" /> Non connesso
              </span>
            )}
          </div>

          {drive.connected ? (
            <div className="mt-4">
              <p className="mb-2 text-xs text-muted-foreground">
                {drive.fileCount} documenti letti dal Drive:
              </p>
              <div className="flex flex-wrap gap-2">
                {drive.files.map((f) => (
                  <span
                    key={f.id}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs"
                  >
                    <FileText className="size-3.5 text-accent" />
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-warn/10 px-3 py-2 text-xs text-warn">
              {drive.error}
            </p>
          )}
        </div>

        {/* Azioni */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/bandi">
            <Button size="lg">
              <Search className="size-4" />
              Cerca bandi
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/dna">
            <Button size="lg" variant="outline" className="bg-transparent">
              <Atom className="size-4" />
              Vedi il DNA aziendale
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Nota: la sintesi completa del DNA e la valutazione di compatibilità saranno attivate
          quando arriveranno i moduli dedicati. La ricerca bandi e la connessione al Drive sono già reali.
        </p>
      </div>
    </main>
  )
}
