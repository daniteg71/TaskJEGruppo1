import { bgFascia, coloreFascia } from '@/lib/scoring';

export function ScoreGauge({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-24 w-24 text-3xl' : size === 'sm' ? 'h-12 w-12 text-base' : 'h-16 w-16 text-xl';
  return (
    <div className={`${dim} ${bgFascia(value)} rounded-full grid place-items-center font-bold ${coloreFascia(value)}`}>
      {value.toFixed(1)}
    </div>
  );
}
