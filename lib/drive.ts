// Modulo di accesso a Google Drive.
// In modalità "mock" non viene mai chiamato: il frontend riceve i dati statici da mock-data.
// Quando DATA_MODE=live il Backend Dev implementa qui la lettura reale.

import type { DnaSnapshot } from './types';

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  testoEstratto: string;
};

export async function listBandiPdf(): Promise<DriveFile[]> {
  throw new Error(
    '[drive.listBandiPdf] non ancora implementato — configurare GOOGLE_SERVICE_ACCOUNT_JSON e DRIVE_BANDI_FOLDER_ID, poi usare googleapis drive.files.list su DRIVE_BANDI_FOLDER_ID filtrando mimeType="application/pdf".'
  );
}

export async function fetchBandoTesto(_fileId: string): Promise<string> {
  throw new Error(
    '[drive.fetchBandoTesto] non ancora implementato — scaricare il PDF con drive.files.get({alt:"media"}) e passare il buffer a Gemini come inlineData (mimeType: application/pdf).'
  );
}

export async function buildDnaSnapshot(): Promise<DnaSnapshot> {
  throw new Error(
    '[drive.buildDnaSnapshot] non ancora implementato — aggregare: Formulario.xlsx (servizi/aree), Bilanci.pdf (fatturato/margine), Visura.pdf (anagrafica), CV/*.pdf (certificazioni/ruoli) in un singolo oggetto DnaSnapshot.'
  );
}
