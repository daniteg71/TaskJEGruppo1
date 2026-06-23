import type { MatchRow } from '@/lib/types';

const colore: Record<MatchRow['esito'], string> = {
  match: 'bg-brand-good/15 text-brand-good',
  parziale: 'bg-brand-warn/15 text-brand-warn',
  mismatch: 'bg-brand-bad/15 text-brand-bad',
};

export function MatchTable({ rows }: { rows: MatchRow[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-slate-500 border-b border-slate-200">
          <th className="py-2">Requisito</th>
          <th className="py-2">Richiesto</th>
          <th className="py-2">Posseduto</th>
          <th className="py-2 w-28 text-right">Esito</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-slate-100">
            <td className="py-2 font-medium">{r.requisito}</td>
            <td className="py-2 text-slate-700">{r.richiesto}</td>
            <td className="py-2 text-slate-700">{r.posseduto}</td>
            <td className="py-2 text-right">
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${colore[r.esito]}`}>
                {r.esito}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
