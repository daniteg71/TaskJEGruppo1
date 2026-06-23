import { BandiSearch } from '@/components/BandiSearch';
import { DnaStatus } from '@/components/DnaStatus';
import { getBandi, getDna } from '@/lib/data-source';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [bandiDrive, dna] = await Promise.all([getBandi('drive'), getDna()]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold">Bandi</h1>
        <p className="text-slate-600 mt-1">
          Scegli la fonte: <strong>Cerca bandi online</strong> (scraping sui portali appalti) oppure{' '}
          <strong>Bandi da Drive</strong> (file pre-caricati). Ogni bando riceve un punteggio 0–10
          rispetto al DNA aziendale. Clicca un bando per l'analisi completa.
        </p>
      </section>

      <DnaStatus dna={dna} />

      <BandiSearch initial={bandiDrive} />
    </div>
  );
}
