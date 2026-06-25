import 'server-only'
import { generateObject } from 'ai'
import { z } from 'zod'
import type { CompanyDna, GrantStrategy } from '@/lib/db/schema'
import type { RawResult } from '@/lib/scrape'

const MODEL = 'openai/gpt-5-mini'

// COST GUARD: di default l'AID a pagamento è SPENTA -> si usano i fallback deterministici
// (zero spesa). Per attivare l'AI reale impostare AI_ENABLED=1 nelle env.
const AI_ENABLED = process.env.AI_ENABLED === '1'

const dnaSchema = z.object({
  headline: z.string().describe('Una frase che sintetizza il posizionamento'),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        group: z.enum([
          'core',
          'competenze',
          'mercato',
          'finanza',
          'innovazione',
          'team',
          'asset',
        ]),
        value: z.number().min(0).max(100),
        summary: z.string(),
      }),
    )
    .min(10)
    .max(22),
  links: z
    .array(
      z.object({
        source: z.string(),
        target: z.string(),
        strength: z.number().min(0).max(1),
      }),
    )
    .min(8),
  strengths: z.array(z.string()).min(3).max(6),
  gaps: z.array(z.string()).min(2).max(5),
})

export async function generateDna(input: {
  name: string
  sector?: string
  description?: string
  driveFiles: string[]
}): Promise<CompanyDna> {
  if (!AI_ENABLED) return fallbackDna(input)
  try {
    return await generateDnaWithAi(input)
  } catch (err) {
    console.log('[v0] generateDna fallback:', (err as Error)?.message)
    return fallbackDna(input)
  }
}

async function generateDnaWithAi(input: {
  name: string
  sector?: string
  description?: string
  driveFiles: string[]
}): Promise<CompanyDna> {
  const { object } = await generateObject({
    model: MODEL,
    schema: dnaSchema,
    prompt: `Sei un analista strategico. Costruisci il "DNA aziendale" come grafo di conoscenza per l'azienda seguente.
Nome: ${input.name}
Settore: ${input.sector || 'non specificato'}
Descrizione: ${input.description || 'non specificata'}
Documenti trovati nella cartella Google Drive (titoli): ${input.driveFiles.join(', ')}

Genera un grafo ricco (12-20 nodi) che rappresenta competenze chiave, mercati, asset, posizionamento finanziario, capacità di innovazione e team.
- Includi un nodo "core" centrale con id "core" che rappresenta l'azienda.
- Collega i nodi in modo coerente (links). Ogni link usa gli id dei nodi.
- value indica la forza/maturità del nodo (0-100).
Rispondi in italiano.`,
  })

  // ensure a core node exists
  if (!object.nodes.some((n) => n.id === 'core')) {
    object.nodes.unshift({
      id: 'core',
      label: input.name,
      group: 'core',
      value: 100,
      summary: input.description || `Azienda del settore ${input.sector || 'N/D'}`,
    })
  }
  return object as CompanyDna
}

const grantsSchema = z.object({
  grants: z
    .array(
      z.object({
        title: z.string(),
        sourceUrl: z.string(),
        sourceName: z.string(),
        description: z.string().describe('2-3 frasi sul bando'),
        deadline: z.string().describe('Scadenza o "Da verificare"'),
        amount: z.string().describe('Importo/contributo stimato o "Da verificare"'),
        category: z.string().describe('Es. Innovazione, Internazionalizzazione, Assunzioni, Digitale, Green'),
        region: z.string().describe('Ambito territoriale es. Nazionale, UE, Lombardia'),
        matchScore: z
          .number()
          .min(0)
          .max(100)
          .describe('Quanto il bando è coerente col DNA aziendale'),
      }),
    )
    .max(12),
})

export async function structureGrants(input: {
  dna: CompanyDna
  company: { name: string; sector?: string }
  raw: RawResult[]
}) {
  if (!AI_ENABLED) return fallbackGrants(input)
  try {
    return await structureGrantsWithAi(input)
  } catch (err) {
    console.log('[v0] structureGrants fallback:', (err as Error)?.message)
    return fallbackGrants(input)
  }
}

async function structureGrantsWithAi(input: {
  dna: CompanyDna
  company: { name: string; sector?: string }
  raw: RawResult[]
}) {
  const { object } = await generateObject({
    model: MODEL,
    schema: grantsSchema,
    prompt: `Sei un esperto di finanza agevolata. Di seguito risultati grezzi presi dal web (titolo, fonte, data, link, estratto) relativi a bandi e finanziamenti per imprese in Italia.

Azienda: ${input.company.name} (settore: ${input.company.sector || 'N/D'}).
Punti di forza dal DNA: ${input.dna.strengths.join('; ')}.
Lacune: ${input.dna.gaps.join('; ')}.

Risultati grezzi:
${input.raw
  .map(
    (r, i) =>
      `${i + 1}. ${r.title} — fonte: ${r.source} — ${r.published}\n   link: ${r.link}\n   estratto: ${r.snippet}`,
  )
  .join('\n')}

Compito: seleziona e normalizza SOLO gli elementi che sono realmente bandi, incentivi, contributi o finanziamenti agevolati rilevanti per questa azienda. Scarta notizie generiche non azionabili. Usa il link reale come sourceUrl. Assegna matchScore in base alla coerenza col DNA. Se un dato non è noto usa "Da verificare". Rispondi in italiano.`,
  })
  return object.grants
}

const strategySchema = z.object({
  summary: z.string(),
  probability: z.number().min(0).max(100),
  fitReasons: z.array(z.string()).min(2).max(6),
  risks: z.array(z.string()).min(1).max(5),
  steps: z.array(z.string()).min(3).max(7),
  recommendedTimeline: z.string(),
})

export async function generateStrategy(input: {
  dna: CompanyDna
  company: { name: string; sector?: string }
  grant: { title: string; description?: string | null; category?: string | null }
}): Promise<GrantStrategy> {
  if (!AI_ENABLED) return fallbackStrategy(input)
  try {
    return await generateStrategyWithAi(input)
  } catch (err) {
    console.log('[v0] generateStrategy fallback:', (err as Error)?.message)
    return fallbackStrategy(input)
  }
}

async function generateStrategyWithAi(input: {
  dna: CompanyDna
  company: { name: string; sector?: string }
  grant: { title: string; description?: string | null; category?: string | null }
}): Promise<GrantStrategy> {
  const { object } = await generateObject({
    model: MODEL,
    schema: strategySchema,
    prompt: `Sei un consulente di finanza agevolata. Valuta la strategia di accesso al seguente bando per l'azienda.

Azienda: ${input.company.name} (settore: ${input.company.sector || 'N/D'}).
DNA - punti di forza: ${input.dna.strengths.join('; ')}.
DNA - lacune: ${input.dna.gaps.join('; ')}.

Bando: ${input.grant.title}
Categoria: ${input.grant.category || 'N/D'}
Descrizione: ${input.grant.description || 'N/D'}

Fornisci: una sintesi della strategia, la probabilità di accesso (0-100) motivata dal DNA, i motivi di coerenza (fitReasons), i rischi, i passi operativi (steps) e una timeline consigliata. Rispondi in italiano.`,
  })
  return object as GrantStrategy
}

/* -------------------------------------------------------------------------- */
/*  Deterministic fallbacks (used when the AI Gateway is unavailable)         */
/*  These keep the whole product functional without an AI credit card.        */
/* -------------------------------------------------------------------------- */

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function fallbackDna(input: {
  name: string
  sector?: string
  description?: string
  driveFiles: string[]
}): CompanyDna {
  const sector = input.sector || 'general'
  const seed = hash(input.name + sector)
  const v = (base: number, salt: number) => 45 + ((seed + salt * 17) % 50) - 5 + (base - 50)

  const nodes: CompanyDna['nodes'] = [
    { id: 'core', label: input.name, group: 'core', value: 100, summary: input.description || `Azienda del settore ${sector}.` },
    { id: 'comp1', label: `Know-how ${sector}`, group: 'competenze', value: v(75, 1), summary: `Competenze tecniche distintive nel settore ${sector}.` },
    { id: 'comp2', label: 'Capitale umano', group: 'team', value: v(68, 2), summary: 'Team e competenze interne consolidate.' },
    { id: 'comp3', label: 'Processi produttivi', group: 'competenze', value: v(62, 3), summary: 'Processi operativi strutturati e ripetibili.' },
    { id: 'mkt1', label: 'Mercato domestico', group: 'mercato', value: v(70, 4), summary: 'Presenza consolidata sul mercato italiano.' },
    { id: 'mkt2', label: 'Export & internazionalizzazione', group: 'mercato', value: v(48, 5), summary: 'Potenziale di crescita sui mercati esteri.' },
    { id: 'mkt3', label: 'Portafoglio clienti', group: 'mercato', value: v(64, 6), summary: 'Base clienti diversificata e ricorrente.' },
    { id: 'fin1', label: 'Solidità finanziaria', group: 'finanza', value: v(58, 7), summary: 'Equilibrio economico-finanziario dai bilanci.' },
    { id: 'fin2', label: 'Capacità di investimento', group: 'finanza', value: v(52, 8), summary: 'Risorse disponibili per nuovi investimenti.' },
    { id: 'inn1', label: 'Ricerca & Sviluppo', group: 'innovazione', value: v(66, 9), summary: 'Attività di R&S e nuovi prodotti.' },
    { id: 'inn2', label: 'Trasformazione digitale', group: 'innovazione', value: v(60, 10), summary: 'Adozione di tecnologie digitali e dati.' },
    { id: 'inn3', label: 'Sostenibilità & Green', group: 'innovazione', value: v(50, 11), summary: 'Transizione ecologica ed efficienza energetica.' },
    { id: 'asset1', label: 'Asset & impianti', group: 'asset', value: v(55, 12), summary: 'Beni strumentali e infrastrutture.' },
    { id: 'asset2', label: 'Proprietà intellettuale', group: 'asset', value: v(45, 13), summary: 'Brevetti, marchi e know-how protetto.' },
  ]

  const links: CompanyDna['links'] = [
    { source: 'core', target: 'comp1', strength: 0.9 },
    { source: 'core', target: 'mkt1', strength: 0.85 },
    { source: 'core', target: 'fin1', strength: 0.8 },
    { source: 'core', target: 'inn1', strength: 0.8 },
    { source: 'core', target: 'comp2', strength: 0.75 },
    { source: 'comp1', target: 'comp3', strength: 0.6 },
    { source: 'comp1', target: 'inn1', strength: 0.7 },
    { source: 'inn1', target: 'inn2', strength: 0.65 },
    { source: 'inn1', target: 'asset2', strength: 0.55 },
    { source: 'inn2', target: 'inn3', strength: 0.5 },
    { source: 'mkt1', target: 'mkt2', strength: 0.45 },
    { source: 'mkt1', target: 'mkt3', strength: 0.7 },
    { source: 'fin1', target: 'fin2', strength: 0.7 },
    { source: 'fin2', target: 'asset1', strength: 0.55 },
    { source: 'comp2', target: 'comp3', strength: 0.6 },
  ]

  return {
    headline: `${input.name}: solide competenze nel settore ${sector}, con leve su innovazione e mercato.`,
    nodes,
    links,
    strengths: [
      `Competenze tecniche distintive nel settore ${sector}`,
      'Base clienti consolidata e ricorrente',
      'Attività di R&S e propensione all\u2019innovazione',
    ],
    gaps: [
      'Espansione internazionale ancora limitata',
      'Margini di miglioramento sulla transizione digitale e green',
    ],
  }
}

function scoreFor(seedStr: string, dna: CompanyDna): number {
  const base = 50 + (hash(seedStr) % 45)
  const boost = Math.round((dna.nodes.reduce((a, n) => a + n.value, 0) / dna.nodes.length - 55) / 3)
  return Math.max(28, Math.min(96, base + boost))
}

function classify(text: string): { category: string; region: string } {
  const t = text.toLowerCase()
  let category = 'Agevolazioni'
  if (/(digital|software|industria 4|tecnolog)/.test(t)) category = 'Digitale'
  else if (/(green|energ|sostenib|ambient)/.test(t)) category = 'Green'
  else if (/(ricerca|innovaz|r&s|sviluppo)/.test(t)) category = 'Innovazione'
  else if (/(export|internazionaliz|estero)/.test(t)) category = 'Internazionalizzazione'
  else if (/(assun|occupa|lavoro|formazione)/.test(t)) category = 'Assunzioni & Formazione'
  let region = 'Nazionale'
  if (/(europ|ue|horizon|next generation)/.test(t)) region = 'UE'
  else if (/region/.test(t)) region = 'Regionale'
  return { category, region }
}

function fallbackGrants(input: {
  dna: CompanyDna
  company: { name: string; sector?: string }
  raw: RawResult[]
}) {
  return input.raw.slice(0, 12).map((r) => {
    const { category, region } = classify(`${r.title} ${r.snippet}`)
    return {
      title: r.title,
      sourceUrl: r.link,
      sourceName: r.source,
      description: r.snippet || 'Bando rilevato dalle fonti web. Verifica i dettagli sulla fonte ufficiale.',
      deadline: 'Da verificare',
      amount: 'Da verificare',
      category,
      region,
      matchScore: scoreFor(r.title + input.company.sector, input.dna),
    }
  })
}

function fallbackStrategy(input: {
  dna: CompanyDna
  company: { name: string; sector?: string }
  grant: { title: string; description?: string | null; category?: string | null }
}): GrantStrategy {
  const probability = scoreFor(input.grant.title + input.company.name, input.dna)
  const cat = input.grant.category || 'agevolazione'
  return {
    summary: `${input.company.name} presenta un profilo coerente con il bando "${input.grant.title}". Le competenze e gli asset rilevati nel DNA aziendale supportano una candidatura nella categoria ${cat}, a condizione di colmare le lacune identificate.`,
    probability,
    fitReasons: [
      ...input.dna.strengths.slice(0, 3),
      `Coerenza tematica con la categoria ${cat}`,
    ],
    risks: [
      ...input.dna.gaps.slice(0, 2),
      'Scadenze e requisiti formali da verificare sulla fonte ufficiale',
    ],
    steps: [
      'Verificare i requisiti di ammissibilità sul bando ufficiale',
      'Raccogliere la documentazione aziendale (bilanci, visura, business plan)',
      'Definire il progetto e il piano di spesa coerente con gli obiettivi del bando',
      'Predisporre la domanda e gli allegati tecnici',
      'Inviare la candidatura entro la scadenza e monitorare l\u2019istruttoria',
    ],
    recommendedTimeline: probability >= 65 ? 'Avvio immediato consigliato (4-6 settimane di preparazione)' : 'Preparazione approfondita consigliata (6-10 settimane)',
  }
}
