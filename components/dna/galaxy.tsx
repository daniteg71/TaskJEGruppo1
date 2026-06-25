'use client'

import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import type { CompanyDna, DnaNode } from '@/lib/db/schema'

const GROUP_COLORS: Record<DnaNode['group'], string> = {
  core: '#ffffff',
  competenze: '#b569b0',
  mercato: '#f59e0b',
  finanza: '#22c55e',
  innovazione: '#8a3b86',
  team: '#c98fc4',
  asset: '#6f2f6b',
}

const GROUP_ANGLE: Record<DnaNode['group'], number> = {
  core: 0,
  competenze: 0,
  mercato: 1.05,
  finanza: 2.1,
  innovazione: 3.15,
  team: 4.2,
  asset: 5.25,
}

function hash(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

type Positioned = DnaNode & { pos: [number, number, number]; color: string }

function layout(dna: CompanyDna): Positioned[] {
  const counters: Record<string, number> = {}
  return dna.nodes.map((n) => {
    if (n.group === 'core' || n.id === 'core') {
      return { ...n, pos: [0, 0, 0], color: GROUP_COLORS.core }
    }
    const k = counters[n.group] ?? 0
    counters[n.group] = k + 1

    const arm = GROUP_ANGLE[n.group] ?? hash(n.group) % 6
    const radius = 5 + k * 2.2 + (hash(n.id) % 100) / 60
    const spiral = radius * 0.32
    const angle = arm + spiral + k * 0.35
    const y = ((hash(n.id + 'y') % 100) / 100 - 0.5) * 4

    return {
      ...n,
      pos: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
      color: GROUP_COLORS[n.group] ?? '#b569b0',
    }
  })
}

function NodeMesh({
  node,
  selected,
  onSelect,
}: {
  node: Positioned
  selected: boolean
  onSelect: (id: string) => void
}) {
  const ref = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const isCore = node.group === 'core' || node.id === 'core'
  const size = isCore ? 1.4 : 0.35 + (node.value / 100) * 0.85

  useFrame((state) => {
    if (!ref.current) return
    const target = hovered || selected ? 1.35 : 1
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15)
    if (isCore) {
      const p = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.04
      ref.current.scale.setScalar(p)
    }
  })

  return (
    <group position={node.pos}>
      <mesh
        ref={ref}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(node.id)
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={selected ? 2.4 : hovered ? 1.8 : 1.1}
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>
      {/* glow halo */}
      <mesh scale={1.6}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={selected ? 0.22 : hovered ? 0.16 : 0.08}
          depthWrite={false}
        />
      </mesh>
      {(isCore || node.value >= 62 || hovered || selected) && (
        <Html
          position={[0, size + 0.6, 0]}
          center
          distanceFactor={18}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <span
            className={
              isCore
                ? 'whitespace-nowrap rounded-md bg-background/70 px-2 py-0.5 text-sm font-semibold text-foreground backdrop-blur-sm'
                : 'whitespace-nowrap rounded-md bg-background/60 px-1.5 py-0.5 text-xs font-medium text-foreground/90 backdrop-blur-sm'
            }
          >
            {node.label}
          </span>
        </Html>
      )}
    </group>
  )
}

function GraphLinks({
  dna,
  nodes,
}: {
  dna: CompanyDna
  nodes: Positioned[]
}) {
  const map = useMemo(() => {
    const m = new Map<string, Positioned>()
    nodes.forEach((n) => m.set(n.id, n))
    return m
  }, [nodes])

  return (
    <group>
      {dna.links.map((l, i) => {
        const a = map.get(l.source)
        const b = map.get(l.target)
        if (!a || !b) return null
        return (
          <Line
            key={i}
            points={[a.pos, b.pos]}
            color="#b569b0"
            lineWidth={1}
            transparent
            opacity={0.18 + l.strength * 0.32}
          />
        )
      })}
    </group>
  )
}

function Scene({
  dna,
  selectedId,
  onSelect,
}: {
  dna: CompanyDna
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const nodes = useMemo(() => layout(dna), [dna])
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.04
  })

  return (
    <>
      <color attach="background" args={['#0b0814']} />
      <fog attach="fog" args={['#0b0814', 24, 60]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#b569b0" distance={40} />
      <pointLight position={[20, 20, 20]} intensity={0.6} color="#8a3b86" />

      <Stars
        radius={80}
        depth={50}
        count={4000}
        factor={4}
        saturation={0}
        fade
        speed={0.6}
      />

      <group ref={groupRef}>
        <GraphLinks dna={dna} nodes={nodes} />
        {nodes.map((n) => (
          <NodeMesh
            key={n.id}
            node={n}
            selected={selectedId === n.id}
            onSelect={onSelect}
          />
        ))}
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={48}
        autoRotate={false}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  )
}

export default function DnaGalaxy({
  dna,
  selectedId,
  onSelect,
}: {
  dna: CompanyDna
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <Canvas
      camera={{ position: [0, 6, 26], fov: 55 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <Scene dna={dna} selectedId={selectedId} onSelect={onSelect} />
    </Canvas>
  )
}
