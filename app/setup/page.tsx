import { Owl } from '@/components/Owl';
import { getCompanyConfig } from '@/lib/company-config';
import { saveConfig } from './actions';

export const dynamic = 'force-dynamic';

export default function SetupPage({ searchParams }: { searchParams: { error?: string } }) {
  const existing = getCompanyConfig();

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <Owl className="w-12" motion="float" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configura la tua azienda</h1>
          <p className="text-slate-600 text-sm">
            Bastano due cose: il nome dell'azienda e la cartella Drive con i documenti (Formulario,
            Bilanci, Visura, CV). Da lì costruiamo il DNA automaticamente.
          </p>
        </div>
      </div>

      <form action={saveConfig} className="space-y-5 rounded-2xl glass brand-ring p-6">
        {searchParams.error && (
          <div className="rounded-lg border border-brand-bad/30 bg-brand-bad/10 px-4 py-2 text-sm text-brand-bad">
            Controlla i campi: serve un nome azienda e un link/ID Drive valido.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">Nome azienda</label>
          <input
            name="companyName"
            defaultValue={existing?.companyName ?? ''}
            placeholder="Es. JEASAP S.r.l."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Cartella Drive (link o ID)</label>
          <input
            name="driveFolder"
            defaultValue={existing?.driveFolderUrl ?? ''}
            placeholder="https://drive.google.com/drive/folders/..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
            required
          />
          <p className="mt-2 rounded-lg bg-brand-light/10 px-3 py-2 text-xs text-brand-ink">
            ⚠️ Perché l'app legga la cartella, condividila (in lettura) con il service account
            dell'app — il link da solo non basta a dare l'accesso. Senza condivisione, l'app resta
            in modalità dimostrativa (dati mock) ma con il tuo nome azienda.
          </p>
        </div>

        <button
          type="submit"
          className="brand-flow w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25"
        >
          {existing ? 'Aggiorna configurazione' : 'Avvia · costruisci il DNA'}
        </button>
      </form>
    </div>
  );
}
