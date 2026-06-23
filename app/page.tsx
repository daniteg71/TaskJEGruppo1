import { BandoCard } from '@/components/BandoCard';
import { DnaStatus } from '@/components/DnaStatus';
import { getBandi, getDna } from '@/lib/data-source';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [bandi, dna] = await Promise.all([getBandi(), getDna()]);
  const ordinati = [...bandi].sort((a, b) => b.punteggio - a.punteggio);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold">Bandi disponibili</h1>
        <p className="text-slate-600 mt-1">
          Punteggio calcolato sui 10 criteri rigidi del bando rispetto al DNA aziendale.
          Clicca un bando per l'analisi completa.
        </p>
      </section>

      <DnaStatus dna={dna} />

      <section className="grid gap-4 md:grid-cols-2">
        {ordinati.map((b) => (
          <BandoCard key={b.id} bando={b} />
        ))}
      </section>
    </div>
  );
}
