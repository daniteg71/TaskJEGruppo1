import 'server-only'
import { cookies } from 'next/headers'
import type { CompanyDna, DriveFile, Grant } from '@/lib/db/schema'

// Nome dell'applicazione (multi-azienda di test).
export const APP_NAME = 'ban4ban'

// Cartella radice del Drive: contiene una SOTTOCARTELLA per azienda (vedi listCompanyFolders).
export const ROOT_FOLDER_ID = process.env.DRIVE_BANDI_FOLDER_ID ?? '1HFXiNjjnrnsNeaMRBDH-vGao-XepH_GE'

const COMPANY_COOKIE = 'ban4ban_company' // memorizza il folderId dell'azienda selezionata

export async function getSelectedFolderId(): Promise<string | null> {
  const c = (await cookies()).get(COMPANY_COOKIE)?.value
  return c || null
}

export function folderUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`
}

// ----------------------------------------------------------------------------
// HOOK 1 — riscrittura del DNA dal Drive: IMPLEMENTATO in `lib/dna-from-drive.ts`
// (`getDnaFromDrive`). Legge il TESTO reale dei file e sintetizza CompanyDna + CorporateDna,
// con ricostruzione incrementale (Step 2). Orchestrato in `app/actions/company.ts`.
// `placeholderDnaFromFiles` qui sotto resta come fallback (solo nomi file).
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// HOOK 2 — filtro REQUISITI MINIMI / compatibilità (Step 4).
// Filtro booleano, gratis (niente AI): separa i bandi COMPATIBILI da quelli NON ammissibili.
// Solo i compatibili andranno all'AI (Step 5) -> risparmio token.
//
// REGOLA PLACEHOLDER (da sostituire con l'algoritmo del team): scarta i bandi di settori
// palesemente non attinenti all'azienda. Il vero confronto requisiti-bando ↔ DNA (ATECO,
// certificazioni, fatturato) si aggancia qui quando arriva l'estrazione DNA + normalizzazione bandi.
// ----------------------------------------------------------------------------
const SETTORI_NON_ATTINENTI: { rx: RegExp; motivo: string }[] = [
  { rx: /editori|emittenti|radiofonic|televisiv|editrici|giornalis/i, motivo: 'Settore editoria/media non attinente' },
  { rx: /agricol|pesca|itticolt|zootecn|forestal/i, motivo: 'Settore agricoltura/pesca non attinente' },
  { rx: /spettacolo|cinema|teatr|festival/i, motivo: 'Settore spettacolo/cultura non attinente' },
]

export function filterCompatible<T extends Grant>(
  _dna: CompanyDna | null,
  grants: T[]
): { compatibili: T[]; scartati: { grant: T; motivo: string }[] } {
  const compatibili: T[] = []
  const scartati: { grant: T; motivo: string }[] = []
  for (const g of grants) {
    const hay = `${g.title} ${g.description ?? ''}`
    const match = SETTORI_NON_ATTINENTI.find((s) => s.rx.test(hay))
    if (match) scartati.push({ grant: g, motivo: match.motivo })
    else compatibili.push(g)
  }
  return { compatibili, scartati }
}

// DNA "segnaposto" minimo finché non arriva quello reale dall'automazione Drive.
// Costruito dai file reali della cartella (nessuna analisi finta).
export function placeholderDnaFromFiles(files: DriveFile[], companyName = 'Azienda'): CompanyDna {
  const groupFor = (name: string): CompanyDna['nodes'][number]['group'] => {
    const n = name.toLowerCase()
    if (n.includes('cv') || n.includes('curriculum')) return 'team'
    if (n.includes('formulario') || n.includes('servizi')) return 'competenze'
    if (n.includes('bilanci') || n.includes('bilancio') || n.includes('finanz')) return 'finanza'
    if (n.includes('visura')) return 'asset'
    return 'mercato'
  }
  const nodes: CompanyDna['nodes'] = [
    { id: 'core', label: companyName, group: 'core', value: 100, summary: 'Azienda (DNA in costruzione dall’automazione Drive).' },
    ...files.slice(0, 20).map((f, i) => ({
      id: `f${i}`,
      label: f.name.replace(/\.[a-z0-9]+$/i, ''),
      group: groupFor(f.name),
      value: 60,
      summary: `Documento dal Drive: ${f.name}`,
    })),
  ]
  const links: CompanyDna['links'] = files.slice(0, 20).map((_, i) => ({ source: 'core', target: `f${i}`, strength: 0.6 }))
  return {
    headline: `${companyName}: DNA dai documenti del Drive.`,
    nodes,
    links,
    strengths: [],
    gaps: [],
  }
}
