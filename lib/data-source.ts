// Single entry point per i dati: il frontend chiama sempre queste funzioni,
// e il flag DATA_MODE decide se rispondono dai mock o da Drive+Gemini.

import { MOCK_ANALISI, MOCK_BANDI, MOCK_DNA } from './mock-data';
import type { AnalisiBando, BandoSummary, DnaSnapshot } from './types';

const MODE = (process.env.DATA_MODE ?? 'mock').toLowerCase();

export async function getDna(): Promise<DnaSnapshot> {
  if (MODE === 'live') {
    const { buildDnaSnapshot } = await import('./drive');
    return buildDnaSnapshot();
  }
  return MOCK_DNA;
}

export async function getBandi(): Promise<BandoSummary[]> {
  if (MODE === 'live') {
    const { listBandiPdf, fetchBandoTesto } = await import('./drive');
    const { valutaBando } = await import('./gemini');
    const dna = await getDna();
    const files = await listBandiPdf();
    const analisi = await Promise.all(
      files.map(async (f) => {
        const testo = await fetchBandoTesto(f.id);
        return valutaBando(dna, testo);
      })
    );
    return analisi.map((a) => a.bando);
  }
  return MOCK_BANDI;
}

export async function getAnalisi(id: string): Promise<AnalisiBando | null> {
  if (MODE === 'live') {
    const { fetchBandoTesto } = await import('./drive');
    const { valutaBando } = await import('./gemini');
    const dna = await getDna();
    const testo = await fetchBandoTesto(id);
    return valutaBando(dna, testo);
  }
  return MOCK_ANALISI[id] ?? null;
}
