import { NextResponse } from 'next/server';
import { getAnalisi } from '@/lib/data-source';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const analisi = await getAnalisi(params.id);
  if (!analisi) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(analisi);
}
