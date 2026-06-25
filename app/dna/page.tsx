import { redirect } from 'next/navigation';
import { DnaGraph } from '@/components/DnaGraph';
import { DnaStatus } from '@/components/DnaStatus';
import { Owl } from '@/components/Owl';
import { getCompanyConfig } from '@/lib/company-config';
import { getDna, getDnaGraph } from '@/lib/data-source';

export const dynamic = 'force-dynamic';

export default async function DnaPage() {
  const config = getCompanyConfig();
  if (!config) redirect('/setup');
  const [dna, graph] = await Promise.all([getDna(), getDnaGraph()]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <Owl className="w-9" motion="float" />
          <span>Knowledge base del <span className="brand-text">DNA</span></span>
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Ogni nodo è un file del Drive aziendale; ogni collegamento ha un significato (passa sopra
          un nodo per leggerlo). Il grafo si rigenera dai file presenti: se il Drive cambia, cambia
          anche la mappa.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Cartella collegata:{' '}
          <a href={config.driveFolderUrl} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
            {config.driveFolderId}
          </a>
        </p>
      </div>

      <div className="rounded-3xl glass brand-ring p-4">
        <DnaGraph graph={graph} />
      </div>

      <DnaStatus dna={dna} />
    </div>
  );
}
