import { NextResponse } from 'next/server';
import { getDna, refreshDna } from '@/lib/data-source';

export const dynamic = 'force-dynamic';

// Forza la ricostruzione del DNA dal Drive (bottone "Aggiorna DNA").
export async function POST() {
  refreshDna();
  const dna = await getDna();
  return NextResponse.json({ ok: true, dna });
}
