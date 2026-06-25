'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Company, Grant, SearchRun } from '@/lib/db/schema'
import { generateDna, generateStrategy, structureGrants } from '@/lib/ai'
import { scrapeGrants } from '@/lib/scrape'
import { getCompanyId, setCompanyId } from '@/lib/session'
import {
  addSearchRun,
  createCompanyRecord,
  getCompany,
  getGrant,
  getLatestRun,
  getRun,
  getRuns,
  setGrantStrategy,
  updateCompanyDna,
} from '@/lib/store'

// "Sintesi statica del contenuto della cartella Drive": per ora i file sono dedotti dal
// nome cartella/azienda. In live qui si leggono i file reali del Drive (lib/drive).
function mockDriveFiles(name: string, sector?: string): string[] {
  const base = [
    'Bilancio_2023.pdf',
    'Bilancio_2024.pdf',
    'Business_Plan.docx',
    'Visura_Camerale.pdf',
    'Organigramma.xlsx',
    'Brochure_Prodotti.pdf',
    'Contratti_Clienti_2024.xlsx',
    'Piano_Marketing.pptx',
    'Certificazioni_Qualita.pdf',
    'Progetti_R&S.docx',
  ]
  if (sector) base.push(`Analisi_Mercato_${sector.replace(/\s+/g, '_')}.pdf`)
  base.push(`Pitch_${name.replace(/\s+/g, '_')}.pdf`)
  return base
}

export async function createCompany(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const sector = String(formData.get('sector') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const driveFolderName = String(formData.get('driveFolderName') || '').trim()

  if (!name) throw new Error('Il nome azienda è obbligatorio')

  const driveFiles = mockDriveFiles(name, sector)
  const dna = await generateDna({ name, sector, description, driveFiles })

  const company = createCompanyRecord({
    name,
    sector: sector || null,
    description: description || null,
    driveFolderName: driveFolderName || 'Drive_' + name,
    driveFolderId: 'mock-' + name.toLowerCase().replace(/\s+/g, '-'),
    dna,
  })

  await setCompanyId(company.id)
  redirect('/dna')
}

export async function getCurrentCompany(): Promise<Company | null> {
  const id = await getCompanyId()
  if (!id) return null
  return getCompany(id)
}

export async function regenerateDna() {
  const company = await getCurrentCompany()
  if (!company) throw new Error('Nessuna azienda')
  const driveFiles = mockDriveFiles(company.name, company.sector ?? undefined)
  const dna = await generateDna({
    name: company.name,
    sector: company.sector ?? undefined,
    description: company.description ?? undefined,
    driveFiles,
  })
  updateCompanyDna(company.id, dna)
  revalidatePath('/dna')
}

export async function searchGrants() {
  const company = await getCurrentCompany()
  if (!company || !company.dna) throw new Error('DNA aziendale non disponibile')

  const sector = company.sector || 'imprese'
  const queries = [
    `bandi finanziamenti ${sector} imprese`,
    `incentivi contributi PMI ${sector}`,
    `bando agevolazioni innovazione ${sector}`,
    `fondo perduto imprese 2026`,
  ]

  const raw = await scrapeGrants(queries)

  let structured: Awaited<ReturnType<typeof structureGrants>> = []
  if (raw.length > 0) {
    structured = await structureGrants({
      dna: company.dna,
      company: { name: company.name, sector: company.sector ?? undefined },
      raw,
    })
  }

  // Salva come NUOVA ricerca nello storico (non sovrascrive le vecchie).
  addSearchRun(
    company.id,
    structured.length,
    raw.length,
    structured.map((grnt) => ({
      title: grnt.title,
      sourceUrl: grnt.sourceUrl,
      sourceName: grnt.sourceName,
      description: grnt.description,
      deadline: grnt.deadline,
      amount: grnt.amount,
      category: grnt.category,
      region: grnt.region,
      matchScore: grnt.matchScore,
      strategy: null,
    }))
  )

  revalidatePath('/dashboard')
  return { found: structured.length, scraped: raw.length }
}

// Bandi della ricerca corrente (o di una specifica dallo storico via runId).
export async function getGrants(runId?: number): Promise<Grant[]> {
  const company = await getCurrentCompany()
  if (!company) return []
  const run = runId ? getRun(company.id, runId) : getLatestRun(company.id)
  if (!run) return []
  return [...run.grants].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
}

// Storico delle ricerche (per la lista "vecchie ricerche").
export async function getSearchHistory(): Promise<
  { id: number; at: string; found: number; scraped: number }[]
> {
  const company = await getCurrentCompany()
  if (!company) return []
  return getRuns(company.id).map((r: SearchRun) => ({
    id: r.id,
    at: r.at.toISOString(),
    found: r.found,
    scraped: r.scraped,
  }))
}

export async function getGrantById(id: number) {
  const company = await getCurrentCompany()
  if (!company) return null
  return getGrant(company.id, id)
}

export async function ensureStrategy(id: number) {
  const company = await getCurrentCompany()
  if (!company || !company.dna) throw new Error('Azienda/DNA non disponibile')
  const grant = await getGrantById(id)
  if (!grant) throw new Error('Bando non trovato')
  if (grant.strategy) return grant.strategy

  const strategy = await generateStrategy({
    dna: company.dna,
    company: { name: company.name, sector: company.sector ?? undefined },
    grant: {
      title: grant.title,
      description: grant.description,
      category: grant.category,
    },
  })

  setGrantStrategy(company.id, id, strategy)
  revalidatePath(`/dashboard/${id}`)
  return strategy
}
