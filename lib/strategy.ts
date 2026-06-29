import 'server-only'
import type { CompanyDna, Grant } from '@/lib/db/schema'
import type { EvaluationResult } from '@/lib/evaluate'

// CONTRATTO dell'output strategico (Step 6). Separiamo DATO e GRAFICA:
//  - l'algoritmo di valutazione (Giuseppe + Emanuel) PRODUCE questo oggetto
//  - la pagina/PDF lo RENDE
// Così i due lavori vanno in parallelo: basta rispettare questo schema.

export type StrategyMatchRow = {
  requisito: string
  richiesto: string
  posseduto: string
  esito: 'match' | 'parziale' | 'mismatch' | 'da-valutare'
}

export type StrategyChecklistItem = { voce: string; fatto: boolean; responsabile?: string }
export type StrategyMilestone = { quando: string; cosa: string }

export type ExecutionStrategy = {
  generatedAt: string
  azienda: {
    nome: string
    piva?: string
    ateco?: string[]
    fatturato?: number
    cert?: string[]
    comp?: string[]
  }
  bando: { titolo: string; fonte: string; url?: string; scadenza?: string; importo?: string }
  score: number | null // 1-10
  giustificazione: string | null // perché questo voto (sunto breve dall'algoritmo)
  matching: StrategyMatchRow[] // tabella match / non-match (vuota finché non c'è l'analisi puntuale)
  checklist: StrategyChecklistItem[]
  milestone: StrategyMilestone[]
  // Analisi dettagliata (motore di valutazione, al click). null se l'AI è spenta/fallisce:
  // la pagina usa allora lo scheletro (giustificazione breve + checklist standard).
  evaluation: EvaluationResult | null
}

// HOOK: costruisce lo "scheletro" della strategia con i DATI REALI disponibili
// (anagrafica azienda dal DNA + dati bando dallo scraping) e lascia SEGNAPOSTO dove
// serve l'AI (score, probabilità, matching specifico). Il team riempie qui.
export function buildStrategy(
  dna: CompanyDna | null,
  grant: Grant,
  nowIso: string,
  evaluation: EvaluationResult | null = null
): ExecutionStrategy {
  const nome = dna?.nodes.find((n) => n.id === 'core')?.label ?? 'Azienda'
  return {
    generatedAt: nowIso,
    azienda: {
      nome,
      // anagrafica strutturata (p.iva, ateco, fin, cert) arriverà dall'estrazione DNA (Gustavo)
    },
    bando: {
      titolo: grant.title,
      fonte: grant.sourceName ?? '—',
      url: grant.sourceUrl ?? undefined,
      scadenza: grant.deadline ?? undefined,
      importo: grant.amount ?? undefined,
    },
    // Voto dettagliato (analisi al click) se disponibile, altrimenti il voto rapido della ricerca.
    score: evaluation?.final_score ?? (grant.matchScore && grant.matchScore > 0 ? grant.matchScore : null),
    giustificazione: evaluation?.summary || grant.scoreReason || null,
    evaluation,
    matching: [], // la tabella match puntuale arriverà con l'analisi dettagliata

    // checklist operativa standard (fattuale, non analisi): la valorizza poi l'algoritmo
    checklist: [
      { voce: 'Verificare i requisiti di ammissibilità sulla pagina ufficiale', fatto: false, responsabile: 'PM' },
      { voce: 'Raccogliere visura, bilanci e certificazioni aggiornate', fatto: false, responsabile: 'Amministrazione' },
      { voce: 'Predisporre il progetto e il piano di spesa coerente col bando', fatto: false, responsabile: 'Tecnico' },
      { voce: 'Preparare gli allegati tecnici e la documentazione richiesta', fatto: false, responsabile: 'Tecnico' },
      { voce: 'Firma digitale e invio della domanda entro la scadenza', fatto: false, responsabile: 'Legale' },
    ],
    milestone: [
      { quando: 'Settimana 1', cosa: 'Verifica ammissibilità e raccolta documenti' },
      { quando: 'Settimana 2-3', cosa: 'Stesura progetto e piano di spesa' },
      { quando: 'Settimana 4', cosa: 'Allegati, revisione e invio' },
    ],
  }
}
