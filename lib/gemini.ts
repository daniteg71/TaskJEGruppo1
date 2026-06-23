// Wrapper per il motore AI (Gemini 1.5 Pro).
// La logica reale parte solo in modalità "live". In mock i risultati arrivano da mock-data.

import type { AnalisiBando, DnaSnapshot } from './types';

export const PROMPT_VALUTAZIONE = `
Sei un valutatore di bandi di gara pubblici italiani.
Ricevi:
  1. Il "DNA" di un'azienda (formulario servizi, bilanci, visura, CV collaboratori).
  2. Il testo integrale di un bando.
Devi produrre UN SOLO oggetto JSON con questa forma esatta:

{
  "punteggio": number tra 0 e 10 (un punto per ciascun criterio soddisfatto, su 10 criteri),
  "raccomandazione": "partecipare" | "partecipare-con-riserva" | "non-partecipare",
  "sintesiBreve": string max 140 caratteri,
  "criteri": [10 oggetti { id, titolo, descrizione, soddisfatto: bool, evidenza }],
  "matchTable": [oggetti { requisito, richiesto, posseduto, esito: "match"|"parziale"|"mismatch" }],
  "analisiCritica": string discorsivo (max 1500 caratteri),
  "checklist": [oggetti { voce, fatto: false, responsabile }]
}

Regole:
- I 10 criteri devono coprire: fatturato, certificazioni, CV chiave, referenze analoghe, margine,
  sede, copertura tecnica, GDPR/sicurezza, capacità finanziaria, requisiti speciali del bando.
- "soddisfatto" deve essere desumibile da evidenza concreta nel DNA, mai assunto.
- Non inventare requisiti non presenti nel bando.
- Rispondi solo con JSON valido, niente prefazioni.
`.trim();

export async function valutaBando(
  _dna: DnaSnapshot,
  _testoBando: string
): Promise<AnalisiBando> {
  throw new Error(
    '[gemini.valutaBando] non ancora implementato — inizializzare GoogleGenerativeAI(GEMINI_API_KEY), modello GEMINI_MODEL, mandare PROMPT_VALUTAZIONE + DNA serializzato + testoBando, poi JSON.parse della risposta validato con zod.'
  );
}
