import { cn } from '@/lib/utils'

function scoreColor(score: number) {
  if (score >= 70) return 'var(--ok)'
  if (score >= 45) return 'var(--warn)'
  return 'var(--danger)'
}

export function MatchRing({
  score,
  size = 56,
  label = 'match',
}: {
  score: number
  size?: number
  label?: string
}) {
  const stroke = size <= 56 ? 5 : 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, score)) / 100) * c
  const color = scoreColor(score)

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span
          className="font-semibold"
          style={{ color, fontSize: size <= 56 ? 15 : 22 }}
        >
          {(Math.min(100, Math.max(0, score)) / 10).toFixed(1)}
        </span>
        {label && size > 56 && (
          <span className="mt-0.5 text-[10px] text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
