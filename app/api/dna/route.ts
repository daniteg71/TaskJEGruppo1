import { NextResponse } from 'next/server';
import { getDna } from '@/lib/data-source';

export async function GET() {
  const dna = await getDna();
  return NextResponse.json(dna);
}
