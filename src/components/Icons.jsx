/*
 * Small 3D icons built from three.js primitives — one per card.
 * Each icon fits in roughly a 0.8 × 0.75 box centred on the origin.
 *
 *   p = primary material (accent on the front card, ink otherwise)
 *   s = secondary material (card colour) for details drawn on top
 *
 * To add one: write a component below and register it in ICONS.
 */
import { useLayoutEffect, useMemo } from 'react'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import interMedium from '@fontsource/inter/files/inter-latin-500-normal.woff?url'

const UP = new THREE.Vector3(0, 1, 0)

/** A rounded rod between two points (used for strokes, edges, tassels…). */
function Rod({ a, b, r = 0.03, m }) {
  const va = new THREE.Vector3(...a)
  const vb = new THREE.Vector3(...b)
  const dir = vb.clone().sub(va)
  const len = dir.length()
  const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize())
  const pos = va.add(vb).multiplyScalar(0.5)
  return (
    <mesh material={m} position={pos} quaternion={quat}>
      <capsuleGeometry args={[r, len, 4, 12]} />
    </mesh>
  )
}

function extrude(shape, depth = 0.08) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 3,
    curveSegments: 24,
  })
  geo.translate(0, 0, -depth / 2)
  return geo
}

// ── Shape geometries (built once) ─────────────────────────────

const ticketGeo = (() => {
  const w = 0.8, h = 0.46, r = 0.06, n = 0.08
  const s = new THREE.Shape()
  s.moveTo(-w / 2 + r, -h / 2)
  s.lineTo(w / 2 - r, -h / 2)
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
  s.lineTo(w / 2, -n)
  s.absarc(w / 2, 0, n, -Math.PI / 2, Math.PI / 2, true) // notch
  s.lineTo(w / 2, h / 2 - r)
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
  s.lineTo(-w / 2 + r, h / 2)
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
  s.lineTo(-w / 2, n)
  s.absarc(-w / 2, 0, n, Math.PI / 2, -Math.PI / 2, true) // notch
  s.lineTo(-w / 2, -h / 2 + r)
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2)
  return extrude(s)
})()

const shieldGeo = (() => {
  const s = new THREE.Shape()
  s.moveTo(0, 0.36)
  s.quadraticCurveTo(0.16, 0.3, 0.3, 0.3)
  s.lineTo(0.3, 0.04)
  s.bezierCurveTo(0.3, -0.16, 0.14, -0.3, 0, -0.37)
  s.bezierCurveTo(-0.14, -0.3, -0.3, -0.16, -0.3, 0.04)
  s.lineTo(-0.3, 0.3)
  s.quadraticCurveTo(-0.16, 0.3, 0, 0.36)
  return extrude(s)
})()

const bubbleGeo = (() => {
  const w = 0.74, h = 0.48, r = 0.14
  const s = new THREE.Shape()
  s.moveTo(-w / 2, h / 2 - r)
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2 + r, h / 2)
  s.lineTo(w / 2 - r, h / 2)
  s.quadraticCurveTo(w / 2, h / 2, w / 2, h / 2 - r)
  s.lineTo(w / 2, -h / 2 + r)
  s.quadraticCurveTo(w / 2, -h / 2, w / 2 - r, -h / 2)
  s.lineTo(-0.08, -h / 2)
  s.lineTo(-0.24, -h / 2 - 0.15) // tail
  s.lineTo(-0.2, -h / 2)
  s.lineTo(-w / 2 + r, -h / 2)
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2, -h / 2 + r)
  return extrude(s)
})()

// ── Icons ─────────────────────────────────────────────────────

/** Dashboards / fintech — bar chart */
function Chart({ p }) {
  return (
    <group rotation={[0.15, -0.4, 0]}>
      <mesh material={p} position={[0, -0.31, 0]}>
        <boxGeometry args={[0.8, 0.035, 0.3]} />
      </mesh>
      {[0.24, 0.4, 0.6].map((h, i) => (
        <RoundedBox key={i} material={p} args={[0.17, h, 0.17]} radius={0.025} position={[-0.24 + i * 0.24, -0.29 + h / 2, 0]} />
      ))}
    </group>
  )
}

/** College ERP — classical institution building */
function Institution({ p }) {
  return (
    <group position={[0, -0.05, 0]}>
      <mesh material={p} position={[0, -0.3, 0]}>
        <boxGeometry args={[0.8, 0.06, 0.34]} />
      </mesh>
      <mesh material={p} position={[0, -0.245, 0]}>
        <boxGeometry args={[0.7, 0.05, 0.28]} />
      </mesh>
      {[-0.24, -0.08, 0.08, 0.24].map((x) => (
        <mesh key={x} material={p} position={[x, -0.04, 0]}>
          <cylinderGeometry args={[0.038, 0.042, 0.36, 16]} />
        </mesh>
      ))}
      <mesh material={p} position={[0, 0.165, 0]}>
        <boxGeometry args={[0.74, 0.05, 0.3]} />
      </mesh>
      {/* triangular pediment */}
      <group position={[0, 0.28, 0]} scale={[1, 0.42, 1]}>
        <mesh material={p} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.43, 0.43, 0.3, 3]} />
        </mesh>
      </group>
    </group>
  )
}

/** Event ticketing — admission ticket */
function Ticket({ p, s }) {
  return (
    <group rotation={[0, 0, -0.18]}>
      <mesh material={p} geometry={ticketGeo} />
      {[-0.15, -0.05, 0.05, 0.15].map((y) => (
        <mesh key={y} material={s} position={[0.16, y, 0.056]}>
          <boxGeometry args={[0.022, 0.05, 0.01]} />
        </mesh>
      ))}
      <Rod m={s} a={[-0.26, 0.08, 0.056]} b={[0.02, 0.08, 0.056]} r={0.018} />
      <Rod m={s} a={[-0.26, -0.02, 0.056]} b={[-0.06, -0.02, 0.056]} r={0.018} />
    </group>
  )
}

/** Multiplayer game — controller */
function Gamepad({ p, s }) {
  return (
    <group scale={1.2}>
      <RoundedBox material={p} args={[0.62, 0.3, 0.16]} radius={0.08} />
      <RoundedBox material={p} args={[0.2, 0.36, 0.15]} radius={0.08} position={[-0.25, -0.06, 0]} rotation={[0, 0, 0.35]} />
      <RoundedBox material={p} args={[0.2, 0.36, 0.15]} radius={0.08} position={[0.25, -0.06, 0]} rotation={[0, 0, -0.35]} />
      <mesh material={s} position={[-0.17, 0.02, 0.085]}>
        <boxGeometry args={[0.14, 0.04, 0.02]} />
      </mesh>
      <mesh material={s} position={[-0.17, 0.02, 0.085]}>
        <boxGeometry args={[0.04, 0.14, 0.02]} />
      </mesh>
      {[
        [0.15, 0.06],
        [0.21, 0],
        [0.15, -0.06],
        [0.09, 0],
      ].map(([x, y]) => (
        <mesh key={`${x}${y}`} material={s} position={[x, y + 0.02, 0.08]}>
          <sphereGeometry args={[0.025, 16, 12]} />
        </mesh>
      ))}
    </group>
  )
}

/** Workshops & seminars — microphone */
function Mic({ p, s }) {
  return (
    <group position={[0, 0.02, 0]} scale={1.15}>
      <mesh material={p} position={[0, 0.17, 0]}>
        <capsuleGeometry args={[0.12, 0.14, 8, 24]} />
      </mesh>
      <mesh material={s} position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.123, 0.012, 8, 32]} />
      </mesh>
      <mesh material={p} position={[0, 0.12, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.19, 0.022, 8, 32, Math.PI]} />
      </mesh>
      <mesh material={p} position={[0, -0.17, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.2, 12]} />
      </mesh>
      <mesh material={p} position={[0, -0.29, 0]}>
        <cylinderGeometry args={[0.17, 0.18, 0.04, 32]} />
      </mesh>
    </group>
  )
}

/** Moderation — shield with a check */
function Shield({ p, s }) {
  return (
    <group>
      <mesh material={p} geometry={shieldGeo} />
      <Rod m={s} a={[-0.12, 0.0, 0.06]} b={[-0.03, -0.09, 0.06]} r={0.028} />
      <Rod m={s} a={[-0.03, -0.09, 0.06]} b={[0.13, 0.11, 0.06]} r={0.028} />
    </group>
  )
}

/** Parking — map pin with a P */
function Pin({ p, colors }) {
  return (
    <group position={[0, 0.02, 0]} scale={1.2}>
      <mesh material={p} position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.2, 32, 24]} />
      </mesh>
      <mesh material={p} position={[0, -0.14, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.186, 0.34, 32]} />
      </mesh>
      <Text font={interMedium} fontSize={0.2} color={colors.secondary} anchorX="center" anchorY="middle" position={[0, 0.1, 0.205]}>
        P
      </Text>
    </group>
  )
}

/** Messaging API — chat bubble */
function Chat({ p, s }) {
  return (
    <group position={[0, 0.06, 0]}>
      <mesh material={p} geometry={bubbleGeo} />
      {[-0.15, 0, 0.15].map((x) => (
        <mesh key={x} material={s} position={[x, 0, 0.05]}>
          <sphereGeometry args={[0.042, 16, 12]} />
        </mesh>
      ))}
    </group>
  )
}

/** Certificates / OCR — document with a seal */
function Certificate({ p, s }) {
  return (
    <group rotation={[0, 0, 0.08]}>
      <RoundedBox material={p} args={[0.52, 0.66, 0.05]} radius={0.02} />
      {[
        [0.32, 0.2],
        [0.32, 0.11],
        [0.22, 0.02],
      ].map(([w, y]) => (
        <mesh key={y} material={s} position={[-0.16 + w / 2, y, 0.03]}>
          <boxGeometry args={[w, 0.03, 0.01]} />
        </mesh>
      ))}
      <mesh material={s} position={[0.11, -0.19, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.02, 24]} />
      </mesh>
      <mesh material={p} position={[0.11, -0.19, 0.045]}>
        <torusGeometry args={[0.045, 0.01, 8, 24]} />
      </mesh>
    </group>
  )
}

/** Degree — graduation cap */
function Cap({ p }) {
  return (
    <group rotation={[0.35, 0, 0]} position={[0, 0.02, 0]}>
      <mesh material={p} position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.2, 32]} />
      </mesh>
      <mesh material={p} position={[0, 0.04, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.52, 0.035, 0.52]} />
      </mesh>
      <mesh material={p} position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.03, 16, 12]} />
      </mesh>
      <Rod m={p} a={[0, 0.07, 0]} b={[0.35, 0.06, 0]} r={0.01} />
      <Rod m={p} a={[0.35, 0.06, 0]} b={[0.35, -0.16, 0]} r={0.01} />
      <mesh material={p} position={[0.35, -0.2, 0]}>
        <coneGeometry args={[0.035, 0.09, 12]} />
      </mesh>
    </group>
  )
}

/** Languages — </> */
function Code({ p }) {
  return (
    <group>
      <Rod m={p} a={[-0.2, 0.17, 0]} b={[-0.36, 0, 0]} r={0.04} />
      <Rod m={p} a={[-0.36, 0, 0]} b={[-0.2, -0.17, 0]} r={0.04} />
      <Rod m={p} a={[0.2, 0.17, 0]} b={[0.36, 0, 0]} r={0.04} />
      <Rod m={p} a={[0.36, 0, 0]} b={[0.2, -0.17, 0]} r={0.04} />
      <Rod m={p} a={[-0.07, -0.25, 0]} b={[0.07, 0.25, 0]} r={0.04} />
    </group>
  )
}

/** Frameworks — stacked layers */
function Layers({ p }) {
  return (
    <group rotation={[0.55, Math.PI / 4, 0]}>
      {[-0.17, 0, 0.17].map((y) => (
        <RoundedBox key={y} material={p} args={[0.46, 0.07, 0.46]} radius={0.025} position={[0, y, 0]} />
      ))}
    </group>
  )
}

/** Databases — stacked cylinders */
function Database({ p }) {
  return (
    <group rotation={[0.3, 0, 0]}>
      {[-0.19, 0, 0.19].map((y) => (
        <mesh key={y} material={p} position={[0, y, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.16, 40]} />
        </mesh>
      ))}
    </group>
  )
}

/** Cloud platforms — cloud */
function Cloud({ p }) {
  return (
    <group position={[0, 0.02, 0]}>
      <mesh material={p} position={[-0.2, -0.04, 0]}>
        <sphereGeometry args={[0.16, 32, 24]} />
      </mesh>
      <mesh material={p} position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.22, 32, 24]} />
      </mesh>
      <mesh material={p} position={[0.21, -0.03, 0]}>
        <sphereGeometry args={[0.15, 32, 24]} />
      </mesh>
      <mesh material={p} position={[0, -0.09, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.12, 0.44, 8, 24]} />
      </mesh>
    </group>
  )
}

/** Tools — gear */
function Gear({ p, s }) {
  const teeth = 8
  return (
    <group>
      <mesh material={p} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.12, 40]} />
      </mesh>
      {Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2
        return (
          <mesh key={i} material={p} position={[Math.cos(a) * 0.25, Math.sin(a) * 0.25, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.13, 0.1, 0.12]} />
          </mesh>
        )
      })}
      <mesh material={s} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.125, 32]} />
      </mesh>
    </group>
  )
}

/** Architecture — connected services */
function Nodes({ p }) {
  const hub = [0, -0.02, 0.06]
  const nodes = [
    [-0.28, 0.2, -0.04],
    [0.26, 0.22, -0.06],
    [-0.22, -0.26, -0.04],
    [0.28, -0.2, 0.02],
  ]
  return (
    <group>
      <RoundedBox material={p} args={[0.17, 0.17, 0.17]} radius={0.03} position={hub} />
      {nodes.map((n) => (
        <group key={n.join()}>
          <mesh material={p} position={n}>
            <sphereGeometry args={[0.075, 24, 16]} />
          </mesh>
          <Rod m={p} a={hub} b={n} r={0.016} />
        </group>
      ))}
      <Rod m={p} a={nodes[0]} b={nodes[1]} r={0.012} />
    </group>
  )
}

const ICONS = {
  chart: Chart,
  institution: Institution,
  ticket: Ticket,
  gamepad: Gamepad,
  mic: Mic,
  shield: Shield,
  pin: Pin,
  chat: Chat,
  certificate: Certificate,
  cap: Cap,
  code: Code,
  layers: Layers,
  database: Database,
  cloud: Cloud,
  gear: Gear,
  nodes: Nodes,
}

// Used when an item has no `icon` (or an unknown one).
const FALLBACK = {
  projects: 'nodes',
  experience: 'chart',
  education: 'cap',
  skills: 'code',
}

export default function Icon({ name, category, primary, secondary }) {
  const mats = useMemo(
    () => ({
      p: new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.05 }),
      s: new THREE.MeshStandardMaterial({ roughness: 0.6 }),
    }),
    [],
  )

  useLayoutEffect(() => {
    mats.p.color.set(primary)
    mats.s.color.set(secondary)
  }, [mats, primary, secondary])

  useLayoutEffect(
    () => () => {
      mats.p.dispose()
      mats.s.dispose()
    },
    [mats],
  )

  const Component = ICONS[name] ?? ICONS[FALLBACK[category]] ?? Nodes
  return <Component p={mats.p} s={mats.s} colors={{ primary, secondary }} />
}
