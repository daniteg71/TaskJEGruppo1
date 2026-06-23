import type { AnalisiBando, BandoSummary, DnaSnapshot } from './types';

export const MOCK_DNA: DnaSnapshot = {
  aggiornatoIl: '2026-06-20T09:00:00Z',
  formulario: {
    servizi: 14,
    areeCoperte: ['Data & Automation', 'AI & Machine Learning', 'Cloud & Infrastructure'],
  },
  bilanci: {
    ultimoFatturato: 1_850_000,
    margineMedio: 0.18,
    anniDisponibili: [2022, 2023, 2024, 2025],
  },
  visura: {
    ragioneSociale: 'JEASAP S.r.l.',
    codiceFiscale: '01234567890',
    sedeLegale: 'Via Esempio 12, 20121 Milano',
  },
  cv: {
    totale: 11,
    certificazioni: ['PMP', 'AWS Solutions Architect', 'ISO 27001 LA', 'Scrum Master'],
    ruoliChiave: ['Project Manager', 'Data Engineer', 'ML Engineer', 'DevOps'],
  },
};

export const MOCK_BANDI: BandoSummary[] = [
  {
    id: 'bando-mit-001',
    titolo: 'Piattaforma di analisi predittiva per la mobilità urbana',
    ente: 'Ministero delle Infrastrutture',
    scadenza: '2026-09-15',
    importo: 480_000,
    area: 'Data & Automation',
    punteggio: 8.5,
    sintesiBreve: 'Forte allineamento su servizi data + PM certificato disponibile.',
  },
  {
    id: 'bando-asl-002',
    titolo: 'Sistema di triage AI per pronto soccorso regionale',
    ente: 'ASL Regione Lombardia',
    scadenza: '2026-08-30',
    importo: 220_000,
    area: 'AI & Machine Learning',
    punteggio: 6.0,
    sintesiBreve: 'Mancano certificazioni sanitarie ma le competenze ML coprono il core.',
  },
  {
    id: 'bando-comune-003',
    titolo: 'Migrazione cloud servizi anagrafici',
    ente: 'Comune di Bologna',
    scadenza: '2026-07-28',
    importo: 95_000,
    area: 'Cloud & Infrastructure',
    punteggio: 7.5,
    sintesiBreve: 'Importo basso ma esperienza diretta su casi simili.',
  },
  {
    id: 'bando-univ-004',
    titolo: 'Cybersecurity assessment dipartimenti universitari',
    ente: 'Università di Padova',
    scadenza: '2026-10-05',
    importo: 130_000,
    area: 'Cybersecurity',
    punteggio: 4.0,
    sintesiBreve: 'Area scoperta dal DNA: nessun pentester nei CV.',
  },
];

export const MOCK_ANALISI: Record<string, AnalisiBando> = {
  'bando-mit-001': {
    bando: MOCK_BANDI[0],
    raccomandazione: 'partecipare',
    criteri: [
      { id: 'c1', titolo: 'Fatturato minimo €1M', descrizione: 'Richiesto fatturato medio biennio ≥ €1M', soddisfatto: true, evidenza: 'Bilanci 2023-2024: media €1.7M' },
      { id: 'c2', titolo: 'PM certificato', descrizione: 'Project Manager con PMP/Prince2', soddisfatto: true, evidenza: 'CV Rossi M. — PMP attivo' },
      { id: 'c3', titolo: '3 progetti analoghi', descrizione: 'Almeno 3 referenze in mobilità/trasporti', soddisfatto: false, evidenza: 'Trovate solo 2 referenze nel Formulario' },
      { id: 'c4', titolo: 'ISO 27001', descrizione: 'Certificazione aziendale ISO 27001', soddisfatto: true, evidenza: 'CV Bianchi S. — Lead Auditor' },
      { id: 'c5', titolo: 'Margine positivo', descrizione: 'EBITDA positivo ultimi 3 anni', soddisfatto: true, evidenza: 'Margine medio 18%' },
      { id: 'c6', titolo: 'Sede in UE', descrizione: 'Sede legale in territorio UE', soddisfatto: true, evidenza: 'Visura: Milano, IT' },
      { id: 'c7', titolo: 'Data Engineer dedicato', descrizione: 'Almeno 1 Data Engineer senior', soddisfatto: true, evidenza: '3 Data Engineer disponibili' },
      { id: 'c8', titolo: 'Stack predittivo', descrizione: 'Esperienza ML su serie temporali', soddisfatto: true, evidenza: 'Caso Formulario: forecasting energy' },
      { id: 'c9', titolo: 'Capacità GDPR', descrizione: 'DPO o competenze GDPR documentate', soddisfatto: false, evidenza: 'Nessun DPO interno' },
      { id: 'c10', titolo: 'Garanzie fideiussorie', descrizione: 'Capacità di costituire fideiussione 10%', soddisfatto: true, evidenza: 'Margine cassa: €380k' },
    ],
    matchTable: [
      { requisito: 'Fatturato', richiesto: '≥ €1M', posseduto: '€1.7M', esito: 'match' },
      { requisito: 'PM Certificato', richiesto: 'PMP/Prince2', posseduto: 'PMP', esito: 'match' },
      { requisito: 'Referenze mobilità', richiesto: '3 progetti', posseduto: '2 progetti', esito: 'parziale' },
      { requisito: 'DPO', richiesto: 'Interno', posseduto: 'Esterno fractional', esito: 'mismatch' },
    ],
    analisiCritica:
      'Bando ad alta affinità: il DNA copre 8/10 criteri rigidi, con due gap recuperabili (terza referenza e DPO). La marginalità storica e la solidità di cassa permettono di affrontare la fideiussione senza stressare la liquidità. Il punto debole reale è il DPO: prevedere un consulente esterno certificato da nominare in fase di stipula, citandolo già in offerta.',
    checklist: [
      { voce: 'Recuperare 3a referenza mobility (es. progetto SmartParking 2024)', fatto: false, responsabile: 'Sales' },
      { voce: 'Lettera incarico DPO esterno', fatto: false, responsabile: 'Legal' },
      { voce: 'Aggiornare CV PM con metriche progetto', fatto: false, responsabile: 'HR' },
      { voce: 'Pre-istruttoria fideiussione con banca', fatto: false, responsabile: 'CFO' },
    ],
  },
};
