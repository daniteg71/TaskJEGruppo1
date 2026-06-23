import { DnaStatus } from '@/components/DnaStatus';
import { getDna } from '@/lib/data-source';

export const dynamic = 'force-dynamic';

export default async function DnaPage() {
  const dna = await getDna();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">DNA aziendale</h1>
        <p className="text-slate-600 mt-1">
          Snapshot aggregato da Formulario, Bilanci, Visura e CV. È la base contro cui ogni bando viene confrontato.
        </p>
      </div>
      <DnaStatus dna={dna} />
    </div>
  );
}
