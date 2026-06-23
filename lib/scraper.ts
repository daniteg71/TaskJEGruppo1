// Ricerca bandi su internet ("Cerca bandi online").
// In mock restituisce risultati finti. In live il Backend Dev implementa lo scraping reale.
//
// STRATEGIA CONSIGLIATA per l'implementazione live:
//   1. Partire dalle aree coperte dal DNA (dna.formulario.areeCoperte) per costruire le query.
//   2. Interrogare i portali appalti pubblici italiani. Opzioni:
//        - API/feed ufficiali quando esistono (es. portali regionali, MEPA/Acquisti in Rete,
//          ANAC dati aperti) -> preferibili allo scraping HTML perché stabili e legali.
//        - In assenza di API, scraping HTML delle pagine di ricerca bando.
//   3. Per ogni risultato estrarre titolo, ente, scadenza, importo, area e URL.
//   4. Passare il testo del bando a gemini.valutaBando(dna, testo) per il punteggio 1-10.
//   5. Restituire BandoSummary[] con fonte: 'scraping' e url valorizzato.
//
// NOTA: lo scraping è più fragile e va fatto rispettando i Terms of Service dei portali e il
// robots.txt. Dove c'è un'API ufficiale, usarla.

import type { BandoSummary, DnaSnapshot } from './types';

export async function cercaBandiOnline(_dna: DnaSnapshot): Promise<BandoSummary[]> {
  throw new Error(
    '[scraper.cercaBandiOnline] non ancora implementato — costruire le query dalle aree del DNA, ' +
      'interrogare i portali appalti (API ufficiali dove disponibili), estrarre i bandi e valutarli ' +
      'con gemini.valutaBando. Restituire BandoSummary[] con fonte: "scraping" e url.'
  );
}
