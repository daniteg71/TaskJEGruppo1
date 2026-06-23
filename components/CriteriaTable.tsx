import type { Criterio } from '@/lib/types';

export function CriteriaTable({ criteri }: { criteri: Criterio[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-slate-500 border-b border-slate-200">
          <th className="py-2 w-10">#</th>
          <th className="py-2">Criterio</th>
          <th className="py-2">Evidenza</th>
          <th className="py-2 w-24 text-right">Esito</th>
        </tr>
      </thead>
      <tbody>
        {criteri.map((c, i) => (
          <tr key={c.id} className="border-b border-slate-100 align-top">
            <td className="py-3 text-slate-400">{i + 1}</td>
            <td className="py-3">
              <div className="font-medium">{c.titolo}</div>
              <div className="text-xs text-slate-500">{c.descrizione}</div>
            </td>
            <td className="py-3 text-slate-700">{c.evidenza}</td>
            <td className="py-3 text-right">
              <span
                className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                  c.soddisfatto ? 'bg-brand-good/15 text-brand-good' : 'bg-brand-bad/15 text-brand-bad'
                }`}
              >
                {c.soddisfatto ? '✓ OK' : '✗ KO'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
