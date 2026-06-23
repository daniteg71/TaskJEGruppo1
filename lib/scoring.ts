import type { Criterio } from './types';

export function calcolaPunteggio(criteri: Criterio[]): number {
  if (criteri.length === 0) return 0;
  const soddisfatti = criteri.filter((c) => c.soddisfatto).length;
  return Math.round((soddisfatti / criteri.length) * 10 * 10) / 10;
}

export function fasciaPunteggio(p: number): 'alto' | 'medio' | 'basso' {
  if (p >= 7.5) return 'alto';
  if (p >= 5) return 'medio';
  return 'basso';
}

export function coloreFascia(p: number): string {
  const f = fasciaPunteggio(p);
  return f === 'alto' ? 'text-brand-good' : f === 'medio' ? 'text-brand-warn' : 'text-brand-bad';
}

export function bgFascia(p: number): string {
  const f = fasciaPunteggio(p);
  return f === 'alto' ? 'bg-brand-good/15' : f === 'medio' ? 'bg-brand-warn/15' : 'bg-brand-bad/15';
}
