import Link from 'next/link';
import type { BandoSummary } from '@/lib/types';
import { ScoreGauge } from './ScoreGauge';

export function BandoCard({ bando }: { bando: BandoSummary }) {
  return (
    <Link
      href={`/bandi/${bando.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-brand-accent"
    >
      <div className="flex items-start gap-4">
        <ScoreGauge value={bando.punteggio} />
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-slate-500">{bando.area}</div>
          <div className="mt-1 font-semibold text-slate-900">{bando.titolo}</div>
          <div className="mt-1 text-sm text-slate-600">{bando.ente}</div>
          <p className="mt-3 text-sm text-slate-700">{bando.sintesiBreve}</p>
          <div className="mt-3 flex gap-4 text-xs text-slate-500">
            <span>Scadenza: {new Date(bando.scadenza).toLocaleDateString('it-IT')}</span>
            <span>Importo: € {bando.importo.toLocaleString('it-IT')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
