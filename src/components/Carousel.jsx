import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, RoundedBox, Text, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import interMedium from '@fontsource/inter/files/inter-latin-500-normal.woff?url'
import interRegular from '@fontsource/inter/files/inter-latin-400-normal.woff?url'
import mono from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff?url'
import { categoryLabels } from '../data/portfolio'
import Icon from './Icons'
import { usePrefersReducedMotion } from '../hooks/useTheme'

// Card geometry, in world units.
const CARD_W = 2.2
const CARD_H = 3
const CARD_D = 0.05
const PAD = 0.2
const ARC_SPACING = 2.75 // arc length between neighbouring cards
const MAX_STEP = 0.6 // max angle (rad) between cards, so small sets stay close together
const MIN_SLOTS = 7 // small sets are repeated round the ring so it always loops

const LEFT = -CARD_W / 2 + PAD
const RIGHT = CARD_W / 2 - PAD
const TOP = CARD_H / 2 - PAD
const BOTTOM = -CARD_H / 2 + PAD
const FACE = CARD_D / 2 + 0.002 // just in front of the card face
const TEXT_W = CARD_W - PAD * 2

export const palettes = {
  light: {
    bg: '#f3f2ee',
    card: '#ffffff',
    ink: '#141414',
    muted: '#8a8984',
    line: '#e2e0da',
    accent: '#ff5a1f',
    shadow: '#1a1a1a',
    shadowOpacity: 0.28,
  },
  dark: {
    bg: '#0e0e0f',
    card: '#1b1b1d',
    ink: '#f1f0ec',
    muted: '#85847f',
    line: '#2c2c2f',
    accent: '#ff6a33',
    shadow: '#000000',
    shadowOpacity: 0.7,
  },
}

const wrap = (d, n) => ((((d + n / 2) % n) + n) % n) - n / 2
const mod = (n, m) => ((n % m) + m) % m

function ringLayout(count) {
  // A lone card stays single; other small sets repeat so the ring loops.
  const slots = count <= 1 ? count : count * Math.ceil(MIN_SLOTS / count)
  const step = Math.min((Math.PI * 2) / Math.max(slots, 1), MAX_STEP)
  return { slots, step, radius: ARC_SPACING / step }
}

export default function Carousel({ items, index, setIndex, onCardClick, theme, ringKey }) {
  const palette = palettes[theme]
  const reduced = usePrefersReducedMotion()
  const stageRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  // `target` mirrors `index` but can be bumped synchronously on drag release,
  // so the ring never sees a frame where the drag offset is gone but the new
  // index hasn't rendered yet.
  const target = useRef(index)
  target.current = index
  const drag = useRef(0)

  useEffect(() => {
    const el = stageRef.current
    let startX = 0
    let pxPerCard = 260

    const onMove = (e) => {
      drag.current = -(e.clientX - startX) / pxPerCard
    }
    const onUp = () => {
      const delta = Math.round(drag.current)
      target.current += delta
      drag.current = 0
      if (delta) setIndex((i) => i + delta)
      setDragging(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
    const onDown = (e) => {
      if (e.button !== 0) return
      startX = e.clientX
      pxPerCard = Math.max(140, el.clientWidth * 0.22)
      setDragging(true)
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    }

    el.addEventListener('pointerdown', onDown)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      onUp()
    }
  }, [setIndex])

  // ── Filter transitions ──
  // The ring keeps showing the previous set while it dissolves into the
  // background (via fog), then swaps to the new set and dissolves back in.
  const [shown, setShown] = useState({ items, key: ringKey })
  const latest = useRef({ items, key: ringKey })
  latest.current = { items, key: ringKey }
  const fade = useRef({ value: 1, target: 1, swapping: false })
  const live = shown.key === ringKey

  useEffect(() => {
    fade.current.target = live ? 1 : 0 // live again = user switched back mid-fade
  }, [live, ringKey])

  const swap = useCallback(
    () =>
      setShown((prev) => {
        if (prev.key !== latest.current.key) return latest.current
        fade.current.target = 1
        fade.current.swapping = false
        return prev
      }),
    [],
  )

  useLayoutEffect(() => {
    fade.current.target = 1
    fade.current.swapping = false
  }, [shown.key])

  const ringItems = live ? items : shown.items
  const layout = ringLayout(ringItems.length)
  const { radius } = layout

  return (
    <div ref={stageRef} className={`stage${dragging ? ' is-dragging' : ''}`}>
      <Canvas
        flat
        dpr={[1, 2]}
        camera={{ fov: 30, position: [0, 0.3, 10] }}
        gl={{ antialias: true, alpha: true }}
        aria-hidden="true"
      >
        <CameraRig radius={radius} fogColor={palette.bg} fade={fade} onFadedOut={swap} reduced={reduced} />
        {/* three.js lights are physically based (÷π), hence the larger numbers */}
        <ambientLight intensity={theme === 'dark' ? 1.3 : 1.7} />
        <directionalLight position={[3, 6, 8]} intensity={theme === 'dark' ? 2 : 2.2} />
        <directionalLight position={[-6, 2, -4]} intensity={0.8} />

        <Ring
          key={shown.key}
          items={ringItems}
          layout={layout}
          live={live}
          reducedEntry={reduced}
          target={target}
          drag={drag}
          onCardClick={onCardClick}
          palette={palette}
          reduced={reduced}
        />

        <ContactShadows
          position={[0, -CARD_H / 2 - 0.3, -radius]}
          scale={radius * 2.6}
          resolution={512}
          far={4}
          blur={2.4}
          opacity={palette.shadowOpacity}
          color={palette.shadow}
        />
      </Canvas>
      <p className="stage-hint">Drag · ← → · Click a card</p>
    </div>
  )
}

/**
 * Frames the front card for any viewport and drives the fog, which does two jobs:
 * fading cards as they go round the back, and dissolving the whole scene into the
 * background colour during filter changes.
 */
function CameraRig({ radius, fogColor, fade, onFadedOut, reduced }) {
  const { camera, size, scene } = useThree()
  const base = useRef({ near: 10, far: 20, front: 10 })

  useFrame((_, dt) => {
    const f = fade.current
    const speed = reduced ? 40 : f.target === 0 ? 9 : 5
    f.value = THREE.MathUtils.damp(f.value, f.target, speed, dt)
    if (f.target === 0 && f.value < 0.08 && !f.swapping) {
      f.swapping = true
      f.value = 0
      onFadedOut()
    }
    if (scene.fog) {
      // Slide the fog window toward the camera, keeping its width, so the front
      // card's visibility tracks `value` linearly (0 = fully dissolved).
      const { near, far, front } = base.current
      const width = far - near
      const nearest = front - 0.6 // slightly in front of the cards' faces
      scene.fog.far = nearest + (far - nearest) * f.value
      scene.fog.near = scene.fog.far - width
    }
  })

  useEffect(() => {
    const aspect = size.width / size.height
    const t = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const fitHeight = CARD_H / 0.74 / t
    const fitWidth = CARD_W / 0.6 / (t * aspect)
    const dist = Math.max(fitHeight, fitWidth)

    camera.position.set(0, 0.35, dist)
    camera.lookAt(0, -0.05, 0)
    camera.updateProjectionMatrix()

    // Cards fade into the background colour as they go round the back.
    base.current = { near: dist + 0.4, far: dist + radius * 1.35, front: dist }
    if (!scene.fog) scene.fog = new THREE.Fog(fogColor, base.current.near, base.current.far)
    scene.fog.color.set(fogColor)
  }, [camera, size, scene, radius, fogColor])

  return null
}

function Ring({ items, layout, live, reducedEntry, target, drag, onCardClick, palette, reduced }) {
  const groups = useRef([])
  // New sets start slightly rotated and swing into place as they fade in.
  const anim = useRef({ current: target.current - (reducedEntry ? 0 : 0.6) })
  const n = items.length
  const { slots, step, radius } = layout

  // While fading out (not live), freeze the active highlight where it was.
  const lastActive = useRef(0)
  if (live && slots) lastActive.current = mod(target.current, slots)
  const activeSlot = lastActive.current

  useFrame((state, dt) => {
    const a = anim.current
    if (live) {
      const goal = target.current + drag.current
      const smoothing = reduced ? 20 : drag.current ? 14 : 5
      a.current = THREE.MathUtils.damp(a.current, goal, smoothing, dt)
    }
    const t = state.clock.elapsedTime

    for (let j = 0; j < slots; j++) {
      const g = groups.current[j]
      if (!g) continue
      const d = wrap(j - a.current, slots)
      const angle = d * step
      const float = reduced ? 0 : Math.sin(t * 0.9 + j * 1.7) * 0.035
      const focus = Math.max(0, 1 - Math.abs(d))
      // Shrink away at the seam behind the ring, where cards wrap round.
      const seam = slots === 1 ? 1 : Math.min(1, Math.max(0, (slots / 2 - Math.abs(d)) / 0.75))

      g.position.set(Math.sin(angle) * radius, float, Math.cos(angle) * radius - radius)
      g.rotation.y = angle
      g.scale.setScalar((0.86 + 0.14 * focus) * seam)
      g.visible = seam > 0.001
    }
  })

  return Array.from({ length: slots }, (_, j) => {
    const i = j % n
    const item = items[i]
    return (
      <group key={`${item.id}-${j}`} ref={(el) => (groups.current[j] = el)}>
        <Card
          item={item}
          number={i + 1}
          active={j === activeSlot}
          palette={palette}
          reduced={reduced}
          // Rotate the shortest way round to the clicked slot (0 = it's already in front).
          onSelect={() => live && onCardClick(Math.round(wrap(j - target.current, slots)))}
        />
      </group>
    )
  })
}

function Card({ item, number, active, palette, reduced, onSelect }) {
  const lift = useRef(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((_, dt) => {
    if (!lift.current) return
    const z = hovered ? 0.12 : 0
    lift.current.position.z = THREE.MathUtils.damp(lift.current.position.z, z, 8, dt)
  })

  return (
    <group
      ref={lift}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > 6) return // it was a drag, not a click
        onSelect()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[CARD_W, CARD_H, CARD_D]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={palette.card} roughness={0.85} />
      </RoundedBox>

      {/* Top row: accent dot + number, category label */}
      <mesh position={[LEFT + 0.04, TOP - 0.045, FACE]}>
        <circleGeometry args={[0.035, 24]} />
        <meshBasicMaterial color={active ? palette.accent : palette.line} />
      </mesh>
      <Text
        font={mono}
        fontSize={0.08}
        letterSpacing={0.04}
        color={palette.muted}
        anchorX="left"
        anchorY="top"
        position={[LEFT + 0.13, TOP, FACE]}
      >
        {String(number).padStart(2, '0')}
      </Text>
      <Text
        font={mono}
        fontSize={0.08}
        letterSpacing={0.08}
        color={palette.muted}
        anchorX="right"
        anchorY="top"
        position={[RIGHT, TOP, FACE]}
      >
        {categoryLabels[item.category].toUpperCase()}
      </Text>

      <Glyph item={item} number={number} active={active} palette={palette} reduced={reduced} />

      {/* Title grows upward from this baseline; meta hangs below it */}
      <Text
        font={interMedium}
        fontSize={item.title.length > 24 ? 0.16 : 0.19} // long titles shrink to stay on 2 lines
        lineHeight={1.1}
        letterSpacing={-0.02}
        maxWidth={TEXT_W}
        color={palette.ink}
        anchorX="left"
        anchorY="bottom"
        position={[LEFT, -0.42, FACE]}
      >
        {item.title}
      </Text>
      <Text
        font={interRegular}
        fontSize={0.09}
        lineHeight={1.35}
        maxWidth={TEXT_W}
        color={palette.muted}
        anchorX="left"
        anchorY="top"
        position={[LEFT, -0.5, FACE]}
      >
        {item.meta}
      </Text>

      {/* Divider + tags */}
      <mesh position={[0, BOTTOM + 0.36, FACE]}>
        <planeGeometry args={[TEXT_W, 0.006]} />
        <meshBasicMaterial color={palette.line} />
      </mesh>
      <Text
        font={mono}
        fontSize={0.07}
        lineHeight={1.55}
        maxWidth={TEXT_W}
        color={palette.muted}
        anchorX="left"
        anchorY="top"
        position={[LEFT, BOTTOM + 0.27, FACE]}
      >
        {(item.tags ?? [])
          .slice(0, 8)
          .map((t) => t.replaceAll(' ', ' ')) // keep multi-word tags on one line
          .join('  /  ')}
      </Text>
    </group>
  )
}

/** The card's 3D icon, with a gentle sway so it stays readable. */
function Glyph({ item, number, active, palette, reduced }) {
  const ref = useRef(null)

  useFrame((state) => {
    const g = ref.current
    if (!g) return
    if (reduced) {
      g.rotation.y = -0.3
      return
    }
    const t = state.clock.elapsedTime + number * 1.3
    g.rotation.y = Math.sin(t * 0.6) * (active ? 0.6 : 0.35)
    g.position.y = 0.5 + Math.sin(t * 1.1) * 0.02
  })

  return (
    <group ref={ref} position={[0, 0.5, 0.24]}>
      <Icon
        name={item.icon}
        category={item.category}
        primary={active ? palette.accent : palette.ink}
        secondary={palette.card}
      />
    </group>
  )
}
