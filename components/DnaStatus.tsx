import type { DnaSnapshot } from '@/lib/types';
import { RefreshDnaButton } from './RefreshDnaButton';

export function DnaStatus({ dna }: { dna: DnaSnapshot }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">DNA aziendale</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Aggiornato {new Date(dna.aggiornatoIl).toLocaleString('it-IT')}
          </span>
          <RefreshDnaButton />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <Item label="Ragione sociale" value={dna.visura.ragioneSociale} />
        <Item label="Sede" value={dna.visura.sedeLegale} />
        <Item label="Ultimo fatturato" value={`€ ${dna.bilanci.ultimoFatturato.toLocaleString('it-IT')}`} />
        <Item label="Margine medio" value={`${(dna.bilanci.margineMedio * 100).toFixed(0)}%`} />
        <Item label="Servizi mappati" value={dna.formulario.servizi.toString()} />
        <Item label="CV totali" value={dna.cv.totale.toString()} />
        <Item label="Aree coperte" value={dna.formulario.areeCoperte.join(', ')} />
        <Item label="Certificazioni" value={dna.cv.certificazioni.join(', ')} />
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-slate-900">{value}</div>
    </div>
  );
}
