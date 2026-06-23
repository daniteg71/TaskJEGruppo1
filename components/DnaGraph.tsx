'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { DnaGraph, GraphNodeType } from '@/lib/dna-graph';

type SimNode = SimulationNodeDatum & {
  id: string;
  label: string;
  type: GraphNodeType;
  weight: number;
};
type SimLink = SimulationLinkDatum<SimNode> & { meaning: string };

// Palette JESAP per tipo di nodo (il "significato" cromatico).
const COLOR: Record<GraphNodeType, string> = {
  core: '#6f2f6b',
  formulario: '#8a3b86',
  bilancio: '#b569b0',
  visura: '#6f2f6b',
  cv: '#9d4d98',
  certificazione: '#c98fc4',
  area: '#7a3576',
};

const LEGEND: { type: GraphNodeType; label: string }[] = [
  { type: 'core', label: 'Azienda' },
  { type: 'formulario', label: 'Formulario' },
  { type: 'bilancio', label: 'Bilanci' },
  { type: 'visura', label: 'Visura' },
  { type: 'cv', label: 'CV' },
  { type: 'certificazione', label: 'Certificazioni' },
  { type: 'area', label: 'Aree' },
];

export function DnaGraph({ graph }: { graph: DnaGraph }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const dragId = useRef<string | null>(null);
  const [size, setSize] = useState({ w: 800, h: 460 });
  const [, setTick] = useState(0);
  const [hover, setHover] = useState<string | null>(null);

  // Copia mutabile di nodi/archi (d3 muta in place). Ricostruita se il grafo cambia.
  const { nodes, links } = useMemo(() => {
    const nodes: SimNode[] = graph.nodes.map((n) => ({ ...n }));
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const links: SimLink[] = graph.links.map((l) => ({
      source: byId.get(l.source)!,
      target: byId.get(l.target)!,
      meaning: l.meaning,
    }));
    return { nodes, links };
  }, [graph]);

  // Dimensioni responsive
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Simulazione a forze, tenuta gentilmente "calda" -> movimento perpetuo dolce
  useEffect(() => {
    const { w, h } = size;
    const margin = 70; // spazio per le etichette ai bordi
    const sim = forceSimulation<SimNode>(nodes)
      .force('charge', forceManyBody().strength(-220))
      .force('link', forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(90).strength(0.5))
      .force('center', forceCenter(w / 2, h / 2))
      .force('x', forceX(w / 2).strength(0.06))
      .force('y', forceY(h / 2).strength(0.08))
      .force('collide', forceCollide<SimNode>((d) => 14 + d.weight * 6))
      .alphaDecay(0.02)
      .alphaTarget(0.012) // non si ferma mai del tutto: drift continuo
      .on('tick', () => {
        // contieni i nodi entro l'area visibile
        for (const n of nodes) {
          n.x = Math.max(margin, Math.min(w - margin, n.x ?? w / 2));
          n.y = Math.max(28, Math.min(h - 28, n.y ?? h / 2));
        }
        setTick((t) => (t + 1) % 1_000_000);
      });
    simRef.current = sim;
    return () => {
      sim.stop();
    };
  }, [nodes, links, size]);

  // Drag dei nodi
  function onPointerDown(e: React.PointerEvent, id: string) {
    dragId.current = id;
    (e.target as Element).setPointerCapture(e.pointerId);
    simRef.current?.alphaTarget(0.2).restart();
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragId.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const n = nodes.find((nn) => nn.id === dragId.current);
    if (n) {
      n.fx = x;
      n.fy = y;
    }
  }
  function onPointerUp() {
    const n = nodes.find((nn) => nn.id === dragId.current);
    if (n) {
      n.fx = null;
      n.fy = null;
    }
    dragId.current = null;
    simRef.current?.alphaTarget(0.012);
  }

  const connected = (id: string) =>
    links.some(
      (l) =>
        ((l.source as SimNode).id === hover && (l.target as SimNode).id === id) ||
        ((l.target as SimNode).id === hover && (l.source as SimNode).id === id)
    );

  return (
    <div className="relative">
      <div
        ref={wrapRef}
        className="relative h-[460px] w-full overflow-hidden rounded-2xl"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(181,105,176,.10), transparent 70%)' }}
      >
        <svg
          ref={svgRef}
          width={size.w}
          height={size.h}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="touch-none"
        >
          <defs>
            <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#b569b0" />
              <stop offset="100%" stopColor="#6f2f6b" />
            </radialGradient>
          </defs>

          {/* ARCHI */}
          {links.map((l, i) => {
            const s = l.source as SimNode;
            const t = l.target as SimNode;
            const active = hover && (s.id === hover || t.id === hover);
            return (
              <g key={i}>
                <line
                  x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke={active ? '#8a3b86' : '#c9a9c6'}
                  strokeWidth={active ? 2 : 1}
                  strokeOpacity={hover && !active ? 0.15 : active ? 0.9 : 0.45}
                />
                {active && (
                  <text
                    x={((s.x ?? 0) + (t.x ?? 0)) / 2}
                    y={((s.y ?? 0) + (t.y ?? 0)) / 2 - 4}
                    textAnchor="middle"
                    className="fill-brand-ink"
                    style={{ fontSize: 10, fontWeight: 600, paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3 }}
                  >
                    {l.meaning}
                  </text>
                )}
              </g>
            );
          })}

          {/* NODI */}
          {nodes.map((n) => {
            const r = 8 + n.weight * 5;
            const dim = hover && hover !== n.id && !connected(n.id);
            return (
              <g
                key={n.id}
                transform={`translate(${n.x ?? 0},${n.y ?? 0})`}
                style={{ cursor: 'grab', opacity: dim ? 0.25 : 1, transition: 'opacity .2s' }}
                onPointerDown={(e) => onPointerDown(e, n.id)}
                onPointerEnter={() => setHover(n.id)}
                onPointerLeave={() => setHover(null)}
              >
                {n.type === 'core' ? (
                  <>
                    <circle r={r + 6} fill="url(#coreGrad)" opacity={0.25} />
                    <circle r={r} fill="url(#coreGrad)" />
                    <image href="/jesap-owl-white.png" x={-r * 0.8} y={-r * 0.55} width={r * 1.6} height={r * 1.1} />
                  </>
                ) : (
                  <circle
                    r={r}
                    fill={COLOR[n.type]}
                    stroke="#fff"
                    strokeWidth={1.5}
                    style={{ filter: !dim ? 'drop-shadow(0 2px 4px rgba(111,47,107,.3))' : 'none' }}
                  />
                )}
                <text
                  y={r + 13}
                  textAnchor="middle"
                  className="fill-slate-600"
                  style={{ fontSize: 10.5, fontWeight: 500, paintOrder: 'stroke', stroke: '#faf7fb', strokeWidth: 3 }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute bottom-3 left-3 text-[11px] text-slate-400">
          Trascina i nodi · passa sopra un nodo per vedere i collegamenti
        </div>
      </div>

      {/* LEGENDA */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {LEGEND.map((l) => (
          <span key={l.type} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR[l.type] }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
