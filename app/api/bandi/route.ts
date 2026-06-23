import { NextResponse } from 'next/server';
import { getBandi } from '@/lib/data-source';
import type { BandoSource } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const param = new URL(req.url).searchParams.get('source');
  const source: BandoSource = param === 'scraping' ? 'scraping' : 'drive';
  try {
    const bandi = await getBandi(source);
    return NextResponse.json({ source, bandi });
  } catch (err) {
    return NextResponse.json(
      { source, error: err instanceof Error ? err.message : 'errore sconosciuto' },
      { status: 502 }
    );
  }
}
