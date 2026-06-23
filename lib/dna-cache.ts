// Cache del DNA aziendale.
//
// Decisione architetturale (vedi README): per l'MVP il DNA viene ricostruito dal Drive
// "a richiesta" (pull) ma messo in cache, così la prima ricerca lo costruisce e le successive
// sono istantanee. Si evita la complessità dei webhook Drive (Opzione A) che scadono ogni ~7gg.
//
// Per passare al modello "Drive sempre connesso" (push/webhook), in futuro basterà che
// l'endpoint webhook chiami invalidateDna() a ogni notifica di modifica del Drive: il prossimo
// accesso ricostruirà il DNA aggiornato. L'hook è già previsto in drive.ts (watchDrive).

import type { DnaSnapshot } from './types';

const TTL_MS = Number(process.env.DNA_CACHE_TTL_MS ?? 10 * 60 * 1000); // default 10 minuti

type CacheEntry = { value: DnaSnapshot; expiresAt: number };
let entry: CacheEntry | null = null;

export async function getCachedDna(builder: () => Promise<DnaSnapshot>): Promise<DnaSnapshot> {
  const now = Date.now();
  if (entry && entry.expiresAt > now) return entry.value;
  const value = await builder();
  entry = { value, expiresAt: now + TTL_MS };
  return value;
}

// Forza la ricostruzione del DNA alla prossima richiesta.
// Chiamata dal bottone "Aggiorna DNA" e (in futuro) dal webhook Drive.
export function invalidateDna(): void {
  entry = null;
}
