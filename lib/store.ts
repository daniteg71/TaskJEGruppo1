import 'server-only'
import type { Grant, ScartatoGrant, SearchRun } from '@/lib/db/schema'

// Persistenza in-memory MULTI-AZIENDA (MVP, niente DB). Storico ricerche per azienda (companyId = folderId).
// NB: si azzera a freddo sul serverless. Per persistenza reale serve un DB.

const g = globalThis as unknown as {
  __jesapRuns?: { runs: SearchRun[]; seq: { grant: number; run: number } }
}
const store = g.__jesapRuns ?? (g.__jesapRuns = { runs: [], seq: { grant: 0, run: 0 } })

export function addSearchRun(
  companyId: string,
  found: number,
  scraped: number,
  nuovi: number,
  giaNoti: number,
  grantsData: Omit<Grant, 'id' | 'companyId' | 'createdAt'>[],
  scartati: ScartatoGrant[]
): SearchRun {
  const run: SearchRun = {
    id: ++store.seq.run,
    companyId,
    at: new Date(),
    found,
    scraped,
    nuovi,
    giaNoti,
    scartati,
    grants: grantsData.map((gr) => ({
      ...gr,
      id: ++store.seq.grant,
      companyId,
      createdAt: new Date(),
    })),
  }
  store.runs.push(run)
  return run
}

export function getRuns(companyId: string): SearchRun[] {
  return store.runs.filter((r) => r.companyId === companyId).sort((a, b) => b.id - a.id)
}

export function getLatestRun(companyId: string): SearchRun | null {
  return getRuns(companyId)[0] ?? null
}

export function getRun(companyId: string, runId: number): SearchRun | null {
  return store.runs.find((r) => r.companyId === companyId && r.id === runId) ?? null
}

export function findGrant(companyId: string, grantId: number): Grant | null {
  for (const run of getRuns(companyId)) {
    const grant = run.grants.find((x) => x.id === grantId)
    if (grant) return grant
  }
  return null
}
