'use client'

import type { CompanyDna, DnaNode } from '@/lib/db/schema'

const COLOR: Record<DnaNode['group'], string> = {
  core: '#ffffff',
  competenze: '#b569b0',
  mercato: '#f59e0b',
  finanza: '#22c55e',
  innovazione: '#8a3b86',
  team: '#c98fc4',
  asset: '#6f2f6b',
}

// Mappa 2D STATICA del DNA: nodo centrale (azienda) + nodi in cerchio attorno.
// Niente fisica/3D: layout deterministico che resta ordinato anche con molti file.
export function DnaMap2D({
  dna,
  selectedId,
  onSelect,
}: {
  dna: CompanyDna
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const W = 1000
  const H = 680
  const cx = W / 2
  const cy = H / 2
  const others = dna.nodes.filter((n) => n.id !== 'core' && n.group !== 'core')
  const core = dna.nodes.find((n) => n.id === 'core' || n.group === 'core')
  const N = Math.max(1, others.length)
  const R = Math.min(cx, cy) * 0.72

  const pos = (i: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / N
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {/* link core -> nodi */}
      {others.map((n, i) => {
        const p = pos(i)
        const active = selectedId === n.id
        return (
          <line
            key={`l-${n.id}`}
            x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke={active ? '#e9b8e4' : '#d9c2e0'}
            strokeOpacity={active ? 0.9 : 0.28}
            strokeWidth={active ? 2 : 1}
          />
        )
      })}

      {/* nodi esterni */}
      {others.map((n, i) => {
        const p = pos(i)
        const r = 14
        const dim = selectedId && selectedId !== n.id
        return (
          <g key={n.id} transform={`translate(${p.x},${p.y})`} style={{ cursor: 'pointer', opacity: dim ? 0.45 : 1 }} onClick={() => onSelect(n.id)}>
            <circle r={r} fill={COLOR[n.group]} stroke="rgba(255,255,255,.85)" strokeWidth={1.5} />
            <text
              y={r + 14}
              textAnchor="middle"
              fill="#ece0ec"
              style={{ fontSize: 12, fontWeight: 500, paintOrder: 'stroke', stroke: 'rgba(11,8,20,.9)', strokeWidth: 3 }}
            >
              {n.label.length > 22 ? n.label.slice(0, 21) + '…' : n.label}
            </text>
          </g>
        )
      })}

      {/* nodo centrale */}
      {core && (
        <g transform={`translate(${cx},${cy})`} style={{ cursor: 'pointer' }} onClick={() => onSelect('core')}>
          <circle r={34} fill="#6f2f6b" opacity={0.25} />
          <circle r={26} fill="url(#coreGrad)" stroke="rgba(255,255,255,.9)" strokeWidth={2} />
          <text textAnchor="middle" y={5} fill="#fff" style={{ fontSize: 13, fontWeight: 700 }}>
            {core.label.length > 10 ? core.label.slice(0, 9) + '…' : core.label}
          </text>
        </g>
      )}

      <defs>
        <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b569b0" />
          <stop offset="100%" stopColor="#6f2f6b" />
        </radialGradient>
      </defs>
    </svg>
  )
}
