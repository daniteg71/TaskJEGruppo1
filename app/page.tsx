import { Check, FileText, FolderOpen, TriangleAlert } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { BandiList } from '@/components/bandi/bandi-list'
import { getCompanyInfo, getGrantsPage, getScartati, getSearchHistory } from '@/app/actions/company'

export const dynamic = 'force-dynamic'
// la ricerca fa scraping + (in prod) sintesi DNA e scoring AI: alza il limite oltre i 10s di default
export const maxDuration = 60

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; run?: string; q?: string; sort?: string }>
}) {
  const { page, run, q, sort } = await searchParams
  const pageNum = page ? Math.max(1, Number.parseInt(page, 10) || 1) : 1
  const runId = run ? Number.parseInt(run, 10) : undefined
  const validRun = Number.isFinite(runId) ? runId : undefined

  const [{ company, companies, selectedId, drive }, paged, history, scartati] = await Promise.all([
    getCompanyInfo(),
    getGrantsPage(pageNum, validRun, q, sort),
    getSearchHistory(),
    getScartati(validRun),
  ])

  return (
    <AppShell companyName={company.name} companies={companies} selectedId={selectedId}>
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Bandi per <span className="text-accent">{company.name}</span>
      </h1>

      {/* Stato Drive — compatto */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <FolderOpen className="size-4 text-accent" /> Drive
        </span>
        {drive.connected ? (
          <span className="flex items-center gap-1 text-ok">
            <Check className="size-4" /> connesso · {drive.fileCount} file
          </span>
        ) : (
          <span className="flex items-center gap-1 text-warn">
            <TriangleAlert className="size-4" /> {drive.error}
          </span>
        )}
        {drive.connected && (
          <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {drive.files.slice(0, 4).map((f) => (
              <span key={f.id} className="inline-flex items-center gap-1 rounded border border-border bg-secondary/40 px-1.5 py-0.5">
                <FileText className="size-3 text-accent" />
                {f.name}
              </span>
            ))}
            {drive.files.length > 4 && <span>+{drive.files.length - 4}</span>}
          </span>
        )}
      </div>

      <BandiList
        grants={paged.grants}
        page={paged.page}
        totalPages={paged.totalPages}
        total={paged.total}
        query={paged.query}
        sort={paged.sort}
        unfilteredTotal={paged.unfilteredTotal}
        history={history}
        scartati={scartati}
        activeRunId={validRun}
      />
    </AppShell>
  )
}
