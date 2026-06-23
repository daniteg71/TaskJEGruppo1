import { NextResponse } from 'next/server';
import { refreshDna } from '@/lib/data-source';

export const dynamic = 'force-dynamic';

// Endpoint per il path "Drive sempre connesso" (Opzione A).
// Google Drive lo chiama a ogni modifica della cartella DNA (vedi drive.watchDrive).
// Qui basta invalidare la cache: il prossimo accesso ricostruirà il DNA aggiornato.
export async function POST() {
  refreshDna();
  return NextResponse.json({ ok: true });
}
