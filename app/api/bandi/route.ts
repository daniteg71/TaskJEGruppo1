import { NextResponse } from 'next/server';
import { getBandi } from '@/lib/data-source';

export async function GET() {
  const bandi = await getBandi();
  return NextResponse.json({ bandi });
}
