'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CONFIG_COOKIE, parseDriveFolderId } from '@/lib/company-config';
import { refreshDna } from '@/lib/data-source';

export async function saveConfig(formData: FormData) {
  const companyName = String(formData.get('companyName') ?? '').trim();
  const link = String(formData.get('driveFolder') ?? '').trim();
  const folderId = parseDriveFolderId(link);

  if (!companyName || !folderId) {
    redirect('/setup?error=1');
  }

  cookies().set(
    CONFIG_COOKIE,
    JSON.stringify({ companyName, driveFolderId: folderId, driveFolderUrl: link }),
    { sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 }
  );

  // Nuovo contesto azienda -> invalida cache DNA e report
  refreshDna();
  redirect('/');
}
