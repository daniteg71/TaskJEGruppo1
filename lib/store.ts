import 'server-only'
import type { Company, CompanyDna, Grant, GrantStrategy, SearchRun } from '@/lib/db/schema'

// Persistenza in-memory (MVP, niente DB esterno).
// NB: lo stato vive nell'istanza serverless: a freddo si azzera. Per persistenza reale
// cross-sessione serve un Postgres (il codice drizzle è già pronto da ripristinare).

const g = globalThis as unknown as {
  __jesapStore?: {
    companies: Company[]
    runs: SearchRun[]
    seq: { company: number; grant: number; run: number }
  }
}

const store =
  g.__jesapStore ??
  (g.__jesapStore = { companies: [], runs: [], seq: { company: 0, grant: 0, run: 0 } })

// ---- Aziende ----

export function createCompanyRecord(input: {
  name: string
  sector: string | null
  description: string | null
  driveFolderName: string | null
  driveFolderId: string | null
  dna: CompanyDna
}): Company {
  const company: Company = {
    id: ++store.seq.company,
    name: input.name,
    sector: input.sector,
    description: input.description,
    driveFolderName: input.driveFolderName,
    driveFolderId: input.driveFolderId,
    dna: input.dna,
    createdAt: new Date(),
  }
  store.companies.push(company)
  return company
}

export function getCompany(id: number): Company | null {
  return store.companies.find((c) => c.id === id) ?? null
}

export function updateCompanyDna(id: number, dna: CompanyDna): void {
  const c = getCompany(id)
  if (c) c.dna = dna
}

// ---- Ricerche (storico) ----

export function addSearchRun(
  companyId: number,
  found: number,
  scraped: number,
  grantsData: Omit<Grant, 'id' | 'companyId' | 'createdAt'>[]
): SearchRun {
  const run: SearchRun = {
    id: ++store.seq.run,
    companyId,
    at: new Date(),
    found,
    scraped,
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

// Tutte le ricerche di un'azienda, dalla più recente.
export function getRuns(companyId: number): SearchRun[] {
  return store.runs.filter((r) => r.companyId === companyId).sort((a, b) => b.id - a.id)
}

export function getLatestRun(companyId: number): SearchRun | null {
  return getRuns(companyId)[0] ?? null
}

export function getRun(companyId: number, runId: number): SearchRun | null {
  return store.runs.find((r) => r.companyId === companyId && r.id === runId) ?? null
}

export function getGrant(companyId: number, grantId: number): Grant | null {
  for (const run of getRuns(companyId)) {
    const grant = run.grants.find((x) => x.id === grantId)
    if (grant) return grant
  }
  return null
}

export function setGrantStrategy(companyId: number, grantId: number, strategy: GrantStrategy): void {
  const grant = getGrant(companyId, grantId)
  if (grant) grant.strategy = strategy
}
