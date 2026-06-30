'use server'

import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import type { Grant } from '@/lib/db/schema'
import { getGrantsPool } from '@/lib/scrape'
import { checkDriveConnection, listCompanyFolders, type DriveStatus } from '@/lib/drive'
import { getDnaFromDrive } from '@/lib/dna-from-drive'
import { APP_NAME, filterCompatible, folderUrl, getSelectedFolderId, placeholderDnaFromFiles } from '@/lib/company-config'
import { addSearchRun, getLatestRun, getRun, getRuns } from '@/lib/store'
import { classifyNewVsKnown, registerSeen } from '@/lib/token-cache'
import { buildStrategy, type ExecutionStrategy } from '@/lib/strategy'
import { refOf, scoreBandi } from '@/lib/scoring'
import { evaluateTenderForCompany } from '@/lib/evaluate'

const PAGE_SIZE = 8
const COMPANY_COOKIE = 'ban4ban_company'

// Azienda selezionata (o la prima disponibile). null se il Drive non ha sottocartelle.
// Memoizzato per-richiesta: getCompanyInfo + getGrantsPage + getSearchHistory + getScartati
// (tutti chiamati in Promise.all dalla home) la risolvono una volta sola.
const resolveSelected = cache(async (): Promise<{ id: string; name: string } | null> => {
  const companies = await listCompanyFolders()
  if (companies.length === 0) return null
  const sel = await getSelectedFolderId()
  return companies.find((c) => c.id === sel) ?? companies[0]
})

// Cambia l'azienda attiva (selettore).
export async function setCompany(folderId: string) {
  ;(await cookies()).set(COMPANY_COOKIE, folderId, { sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 })
  revalidatePath('/')
  revalidatePath('/dna')
}

// `withDna` costruisce la "galassia" DNA (download file + sintesi Gemini): SERVE solo alla
// pagina /dna. Home e strategia NON usano il dna qui → di default lo saltiamo (grosso risparmio:
// niente download dei file né chiamata Gemini sul render di quelle pagine).
export async function getCompanyInfo(opts?: { withDna?: boolean }) {
  // PRE-DOWNLOAD "a monte": avvia (senza bloccare) lo scaricamento del pool bandi mentre la
  // pagina si carica, così al click su "Cerca bandi" il pool è già pronto. Non lancia mai.
  void getGrantsPool().catch(() => {})

  const companies = await listCompanyFolders()
  const selected = await resolveSelected()
  const folderId = selected?.id
  const drive: DriveStatus = await checkDriveConnection(folderId)
  let dna = null
  let corporateDna = null
  if (opts?.withDna && folderId && drive.connected) {
    const built = await getDnaFromDrive(folderId, selected?.name)
    dna = built?.companyDna ?? placeholderDnaFromFiles(drive.files, selected?.name)
    corporateDna = built?.corporateDna ?? null
  }
  return {
    appName: APP_NAME,
    company: {
      name: selected?.name ?? 'Azienda',
      driveFolderId: folderId ?? '',
      driveFolderUrl: folderId ? folderUrl(folderId) : '#',
    },
    companies,
    selectedId: folderId ?? null,
    drive,
    dna,
    corporateDna,
  }
}

const REGIONALI = ['Lazio Innova', 'Sviluppo Toscana', 'Sardegna Impresa']
const regioneOf = (source: string) => (REGIONALI.includes(source) ? 'Regionale' : 'Nazionale')

// CERCA BANDI: scraping (indipendente dal DNA) -> filtro requisiti minimi -> voto 1-10 -> storico.
export async function searchGrants() {
  const selected = await resolveSelected()
  const companyId = selected?.id ?? 'none'

  const raw = await getGrantsPool() // pool condiviso pre-scaricato (no re-scrape a ogni ricerca)
  raw.sort((a, b) => {
    const ta = a.published ? Date.parse(a.published) : NaN
    const tb = b.published ? Date.parse(b.published) : NaN
    return (Number.isNaN(tb) ? -Infinity : tb) - (Number.isNaN(ta) ? -Infinity : ta)
  })

  // DNA dell'azienda selezionata (cache incrementale). Robusto: niente DNA -> fallback nello scoring.
  // Il CorporateDna porta già `regione` e `settori`, usati dal filtro ammissibilità.
  let corporateDna = null
  try {
    const built = await getDnaFromDrive(selected?.id, selected?.name)
    corporateDna = built?.corporateDna ?? null
  } catch {
    /* si procede senza DNA */
  }

  let grants: Omit<Grant, 'id' | 'companyId' | 'createdAt'>[] = raw.map((r) => ({
    ref: refOf({ source: r.source, link: r.link }),
    title: r.title,
    sourceUrl: r.link,
    sourceName: r.source,
    description: r.snippet,
    deadline: 'Da verificare',
    amount: 'Da verificare',
    category: null,
    region: regioneOf(r.source),
    matchScore: 0,
    scoreReason: null,
    strategy: null,
  }))

  const { compatibili, scartati } = filterCompatible(corporateDna, grants as Grant[])
  const scartatiData = scartati.map((s) => ({
    title: s.grant.title,
    sourceName: s.grant.sourceName,
    sourceUrl: s.grant.sourceUrl,
    motivo: s.motivo,
  }))

  // VALUTAZIONE 1-10 (batch Gemini + cache + fallback). Mai blocca la ricerca.
  try {
    const scores = await scoreBandi(
      corporateDna,
      compatibili.map((g) => ({
        ref: refOf({ source: g.sourceName, link: g.sourceUrl }),
        title: g.title,
        source: g.sourceName ?? '',
        text: g.description ?? '',
      }))
    )
    for (const g of compatibili) {
      const s = scores[refOf({ source: g.sourceName, link: g.sourceUrl })]
      g.matchScore = s ? s.score : 0
      g.scoreReason = s ? s.reason : null
    }
  } catch {
    /* la ricerca funziona comunque, senza voto */
  }
  compatibili.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))

  const { nuovi, giaNoti } = classifyNewVsKnown(compatibili)
  registerSeen(compatibili, new Date().toISOString())

  addSearchRun(companyId, compatibili.length, raw.length, nuovi.length, giaNoti.length, compatibili, scartatiData)

  revalidatePath('/')
  return {
    found: compatibili.length,
    scraped: raw.length,
    scartati: scartatiData.length,
    nuovi: nuovi.length,
    giaNoti: giaNoti.length,
  }
}

export async function getGrantsPage(
  page = 1,
  runId?: number,
  q?: string,
  sort?: string
): Promise<{
  grants: Grant[]
  page: number
  totalPages: number
  total: number
  query: string
  sort: string
  unfilteredTotal: number
}> {
  const companyId = (await resolveSelected())?.id ?? 'none'
  const run = runId ? getRun(companyId, runId) : getLatestRun(companyId)
  const allRaw = run?.grants ?? []
  const query = (q ?? '').trim()
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const filtered = words.length
    ? allRaw.filter((g) => {
        const hay = `${g.title} ${g.description ?? ''}`.toLowerCase()
        return words.every((w) => hay.includes(w))
      })
    : allRaw

  const sortKey = sort ?? 'recenti'
  const titleScore = (g: Grant) => {
    if (!words.length) return 0
    const t = g.title.toLowerCase()
    return words.filter((w) => t.includes(w)).length
  }
  const all =
    sortKey === 'voto'
      ? [...filtered].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
      : sortKey === 'az'
        ? [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'it'))
        : words.length
          ? [...filtered].sort((a, b) => titleScore(b) - titleScore(a))
          : filtered

  const total = all.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const p = Math.min(Math.max(1, page), totalPages)
  const grants = all.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE)
  return { grants, page: p, totalPages, total, query, sort: sortKey, unfilteredTotal: allRaw.length }
}

// Ricostruisce un Grant dallo "snapshot" JSON passato nell'URL (?b=) dal link "Strategia".
// Approccio di Gustavo (gusuzin, PR #2): la pagina NON dipende dallo store in-memory (che sul
// serverless si azzera tra istanze → 404), perché i dati del bando viaggiano nell'URL.
function grantFromSnapshot(raw: string | undefined, companyId: string): Grant | null {
  if (!raw) return null
  try {
    const s = JSON.parse(raw) as Partial<Grant>
    if (!s || typeof s.title !== 'string' || !s.title) return null
    return {
      id: 0,
      ref: refOf({ source: s.sourceName, link: s.sourceUrl }),
      companyId,
      title: s.title,
      sourceUrl: s.sourceUrl ?? null,
      sourceName: s.sourceName ?? null,
      description: s.description ?? null,
      deadline: s.deadline ?? null,
      amount: s.amount ?? null,
      category: null,
      region: s.region ?? null,
      matchScore: typeof s.matchScore === 'number' ? s.matchScore : null,
      scoreReason: s.scoreReason ?? null,
      strategy: null,
      createdAt: new Date(),
    }
  } catch {
    return null
  }
}

// Output strategico per un bando. PRIMARIO: snapshot del bando nell'URL (approccio Gustavo) →
// indipendente da store/istanza/cold-start. FALLBACK: URL "nuda" (senza ?b=) → ricostruzione
// dal pool condiviso tramite il ref stabile. In entrambi i casi: niente più 404 dallo store.
export async function getStrategy(idOrRef: string, snapshotRaw?: string): Promise<ExecutionStrategy | null> {
  const selected = await resolveSelected()
  const companyId = selected?.id ?? 'none'

  // 1) PRIMARIO: snapshot nell'URL.
  let grant = grantFromSnapshot(snapshotRaw, companyId)

  // 2) FALLBACK: ricostruisci dal pool condiviso col ref (URL "nude"/condivise senza snapshot).
  if (!grant) {
    const pool = await getGrantsPool()
    const raw = pool.find((r) => refOf({ source: r.source, link: r.link }) === idOrRef)
    if (raw) {
      grant = {
        id: 0,
        ref: idOrRef,
        companyId,
        title: raw.title,
        sourceUrl: raw.link,
        sourceName: raw.source,
        description: raw.snippet,
        deadline: 'Da verificare',
        amount: 'Da verificare',
        category: null,
        region: regioneOf(raw.source),
        matchScore: 0,
        scoreReason: null,
        strategy: null,
        createdAt: new Date(),
      }
    }
  }
  if (!grant) return null

  const ref = grant.ref ?? refOf({ source: grant.sourceName, link: grant.sourceUrl })
  const built = await getDnaFromDrive(selected?.id, selected?.name)
  const corporateDna = built?.corporateDna ?? null

  // Voto rapido se non arriva già dallo snapshot (così la pagina mostra sempre un punteggio).
  if (grant.matchScore == null || grant.matchScore <= 0) {
    try {
      const scores = await scoreBandi(corporateDna, [
        { ref, title: grant.title, source: grant.sourceName ?? '', text: grant.description ?? '' },
      ])
      const s = scores[ref]
      if (s) {
        grant.matchScore = s.score
        grant.scoreReason = s.reason
      }
    } catch {
      /* la strategia funziona anche senza voto rapido */
    }
  }

  // Analisi dettagliata (6 dimensioni + checklist) — cache per (ref + versione DNA).
  const evaluation = await evaluateTenderForCompany(
    corporateDna,
    {
      id: ref,
      title: grant.title,
      source: grant.sourceName ?? undefined,
      text: [grant.description, grant.region && `Ambito: ${grant.region}`, grant.amount && `Importo: ${grant.amount}`]
        .filter(Boolean)
        .join('\n'),
    },
    { strengths: built?.companyDna.strengths, gaps: built?.companyDna.gaps }
  )
  return buildStrategy(built?.companyDna ?? null, grant, new Date().toISOString(), evaluation)
}

export async function getSearchHistory(): Promise<
  { id: number; at: string; found: number; scraped: number; nuovi: number; giaNoti: number; scartati: number }[]
> {
  const companyId = (await resolveSelected())?.id ?? 'none'
  return getRuns(companyId).map((r) => ({
    id: r.id,
    at: r.at.toISOString(),
    found: r.found,
    scraped: r.scraped,
    nuovi: r.nuovi,
    giaNoti: r.giaNoti,
    scartati: r.scartati.length,
  }))
}

export async function getScartati(runId?: number): Promise<import('@/lib/db/schema').ScartatoGrant[]> {
  const companyId = (await resolveSelected())?.id ?? 'none'
  const run = runId ? getRun(companyId, runId) : getLatestRun(companyId)
  return run?.scartati ?? []
}
