// Contratto del "Corporate DNA" — vedi docs/PIPELINE.md (Step 1) e docs/dna_schema.json.
// Chiavi contratte per risparmiare token nelle chiamate AI. È il formato che:
//  - lo Step 1 (estrazione da Drive, Gustavo) deve PRODURRE
//  - lo Step 4 (filtro requisiti minimi) e lo Step 5 (scoring) devono CONSUMARE

export type CorporateExperience = {
  id: string
  tag: string
  valore: number // € del progetto
  desc: string
}

export type CorporateDna = {
  p_iva: string
  rag_soc: string
  ateco: string[]
  fin: {
    ult_bilancio_anno: number
    fatturato: number
    cap_sociale: number
    utile_netto: number
  }
  cert: string[] // es. "ISO-9001", "ISO-27001"
  comp: string[] // competenze chiave
  esperienze: CorporateExperience[]
}
