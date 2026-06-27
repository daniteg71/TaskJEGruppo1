import 'server-only'
import type { CompanyDna, DriveFile, Grant } from '@/lib/db/schema'

// App MONO-AZIENDA (niente login): pre-configurata per l'azienda del Drive collegato.
// Per cambiare azienda/cartella basta modificare qui (o le env su Vercel).
export const COMPANY = {
  name: 'RUGEST',
  driveFolderId: process.env.DRIVE_BANDI_FOLDER_ID ?? '1HFXiNjjnrnsNeaMRBDH-vGao-XepH_GE',
  get driveFolderUrl() {
    return `https://drive.google.com/drive/folders/${this.driveFolderId}`
  },
}

// ----------------------------------------------------------------------------
// HOOK 1 — riscrittura del DNA dal Drive (se ne occupa GUSTAVO con la sua API).
// Per ora NON tocca il DNA: restituisce quello esistente. Quando arriverà il codice,
// si implementa qui la lettura dei file (listDriveFiles) + sintesi.
// ----------------------------------------------------------------------------
export async function rewriteDnaFromDrive(currentDna: CompanyDna | null): Promise<CompanyDna | null> {
  return currentDna
}

// ----------------------------------------------------------------------------
// HOOK 2 — algoritmo di COMPATIBILITÀ (arriverà dal team).
// Decide quali bandi sono compatibili col DNA. Per ora PASS-THROUGH (nessun filtro finto):
// mostra tutti i bandi reali trovati. Quando arriverà l'algoritmo, si filtra qui.
// ----------------------------------------------------------------------------
export function filterCompatible<T extends Grant>(_dna: CompanyDna | null, grants: T[]): T[] {
  return grants
}

// DNA "segnaposto" minimo finché non arriva quello reale dall'automazione Drive.
// Costruito dai file reali della cartella (nessuna analisi finta).
export function placeholderDnaFromFiles(files: DriveFile[]): CompanyDna {
  const groupFor = (name: string): CompanyDna['nodes'][number]['group'] => {
    const n = name.toLowerCase()
    if (n.includes('cv') || n.includes('curriculum')) return 'team'
    if (n.includes('formulario') || n.includes('servizi')) return 'competenze'
    if (n.includes('bilanci') || n.includes('bilancio') || n.includes('finanz')) return 'finanza'
    if (n.includes('visura')) return 'asset'
    return 'mercato'
  }
  const nodes: CompanyDna['nodes'] = [
    { id: 'core', label: COMPANY.name, group: 'core', value: 100, summary: 'Azienda (DNA in costruzione dall’automazione Drive).' },
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
    headline: `${COMPANY.name}: DNA generato dai documenti del Drive (in attesa dell’automazione completa).`,
    nodes,
    links,
    strengths: [],
    gaps: [],
  }
}
