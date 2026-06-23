export type AreaInteresse =
  | 'Data & Automation'
  | 'Cybersecurity'
  | 'Cloud & Infrastructure'
  | 'AI & Machine Learning'
  | 'Software Development';

export type Criterio = {
  id: string;
  titolo: string;
  descrizione: string;
  soddisfatto: boolean;
  evidenza: string;
};

export type MatchRow = {
  requisito: string;
  richiesto: string;
  posseduto: string;
  esito: 'match' | 'parziale' | 'mismatch';
};

export type ChecklistItem = {
  voce: string;
  fatto: boolean;
  responsabile?: string;
};

export type BandoSummary = {
  id: string;
  titolo: string;
  ente: string;
  scadenza: string;
  importo: number;
  area: AreaInteresse;
  punteggio: number;
  sintesiBreve: string;
};

export type AnalisiBando = {
  bando: BandoSummary;
  criteri: Criterio[];
  matchTable: MatchRow[];
  analisiCritica: string;
  checklist: ChecklistItem[];
  raccomandazione: 'partecipare' | 'partecipare-con-riserva' | 'non-partecipare';
};

export type DnaSnapshot = {
  aggiornatoIl: string;
  formulario: { servizi: number; areeCoperte: AreaInteresse[] };
  bilanci: { ultimoFatturato: number; margineMedio: number; anniDisponibili: number[] };
  visura: { ragioneSociale: string; codiceFiscale: string; sedeLegale: string };
  cv: { totale: number; certificazioni: string[]; ruoliChiave: string[] };
};
