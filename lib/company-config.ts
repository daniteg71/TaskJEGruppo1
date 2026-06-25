// Configurazione azienda: la PRIMA cosa che l'azienda fornisce è nome + link cartella Drive.
// L'automazione del DNA è generica e gira su qualunque cartella: il folderId è solo un input.
//
// Storage: cookie (single-tenant, niente DB). Per un setup "fisso per tutto il deploy" si può
// spostare in una env var o in un KV store più avanti — la logica di lettura resta questa.

import { cookies } from 'next/headers';

export type CompanyConfig = {
  companyName: string;
  driveFolderId: string;
  driveFolderUrl: string;
};

export const CONFIG_COOKIE = 'bandi_dna_config';

// Estrae il folder ID da un link Drive o accetta direttamente l'ID.
// Esempi: https://drive.google.com/drive/folders/<ID>?hl=it  ->  <ID>
export function parseDriveFolderId(input: string): string | null {
  const s = input.trim();
  const m = s.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{16,}$/.test(s)) return s; // ID incollato direttamente
  return null;
}

export function getCompanyConfig(): CompanyConfig | null {
  const raw = cookies().get(CONFIG_COOKIE)?.value;
  if (!raw) return null;
  try {
    const c = JSON.parse(raw) as CompanyConfig;
    return c.companyName && c.driveFolderId ? c : null;
  } catch {
    return null;
  }
}
