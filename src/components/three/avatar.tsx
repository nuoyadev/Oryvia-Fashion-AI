"use client";

import * as THREE from "three";
import { useMemo } from "react";
import {
  isShorts,
  isSkirt,
  layerRank,
  sleeveKind,
  type BodyMetrics,
  type GarmentSpec,
} from "./metrics";

function v2(x: number, y: number): THREE.Vector2 {
  return new THREE.Vector2(x, y);
}

function SkinMaterial({ color }: { color: string }) {
  return <meshStandardMaterial color={color} roughness={0.72} metalness={0.02} />;
}

function FabricMaterial({ color, metalness = 0.06 }: { color: string; metalness?: number }) {
  return <meshStandardMaterial color={color} roughness={0.55} metalness={metalness} />;
}

// ── avatar body ──────────────────────────────────────────────────

export function AvatarBody({ m }: { m: BodyMetrics }) {
  const torsoPts = useMemo(
    () => [
      v2(0.001, m.torsoH),
      v2(m.shoulderR * 0.9, m.torsoH),
      v2(m.chestR, m.torsoH * 0.72),
      v2(m.waistR, m.torsoH * 0.45),
      v2(m.hipR, 0),
    ],
    [m]
  );

  const armLen = m.armL - m.armR * 1.6;

  return (
    <group>
      {/* legs */}
      {[1, -1].map((side) => (
        <mesh key={`leg-${side}`} position={[side * m.legR * 0.75, m.legL / 2, 0]}>
          <capsuleGeometry args={[m.legR, m.legL - m.legR * 1.6, 6, 20]} />
          <SkinMaterial color={m.skin} />
        </mesh>
      ))}

      {/* torso (lathe) */}
      <mesh position={[0, m.hipY, 0]}>
        <latheGeometry args={[torsoPts, 44]} />
        <SkinMaterial color={m.skin} />
      </mesh>

      {/* arms */}
      {[1, -1].map((side) => (
        <mesh
          key={`arm-${side}`}
          position={[side * (m.shoulderR * 0.82 + m.armR * 0.3), m.shoulderY - m.height * 0.012 - armLen / 2, 0]}
          rotation={[0, 0, side * -0.08]}
        >
          <capsuleGeometry args={[m.armR, armLen, 6, 16]} />
          <SkinMaterial color={m.skin} />
        </mesh>
      ))}

      {/* neck */}
      <mesh position={[0, m.shoulderY + (m.neckTopY - m.shoulderY) / 2, 0]}>
        <cylinderGeometry args={[m.neckR * 0.9, m.neckR, m.neckTopY - m.shoulderY, 24]} />
        <SkinMaterial color={m.skin} />
      </mesh>

      {/* hair (back) + face (front) */}
      <mesh position={[0, m.headCenterY + m.headR * 0.03, -m.headR * 0.12]}>
        <sphereGeometry args={[m.headR, 32, 24]} />
        <meshStandardMaterial color={m.hair} roughness={0.85} />
      </mesh>
      <mesh position={[0, m.headCenterY + m.headR * 0.02, m.headR * 0.12]}>
        <sphereGeometry args={[m.headR * 0.82, 32, 24]} />
        <SkinMaterial color={m.skin} />
      </mesh>
    </group>
  );
}

// ── garments ─────────────────────────────────────────────────────

function TopShell({
  m,
  spec,
  fit,
}: {
  m: BodyMetrics;
  spec: GarmentSpec;
  fit: number;
}) {
  const category = spec.category;
  const kind = sleeveKind(category, spec.subcategory);

  let bottomY: number;
  let rBottom: number;
  if (category === "dresses") {
    bottomY = m.kneeY * 0.72;
    rBottom = m.hipR * 1.28 * fit + 0.02;
  } else if (category === "outerwear") {
    bottomY = m.legL * 0.62;
    rBottom = m.hipR * 1.06 * fit + 0.014;
  } else {
    bottomY = m.waistY;
    rBottom = m.waistR * fit + 0.008;
  }

  const topY = m.shoulderY;
  const relTop = topY - bottomY;
  const rShoulder = m.shoulderR * 0.92 * fit + 0.008;
  const rChest = m.chestR * fit + 0.008;

  const pts = useMemo(
    () => [
      v2(0.001, relTop),
      v2(rShoulder, relTop),
      v2(rChest, relTop * 0.7),
      v2(rChest * 0.98, relTop * 0.52),
      v2(rBottom, 0),
    ],
    [relTop, rShoulder, rChest, rBottom]
  );

  const sleeveLen = kind === "none" ? 0 : kind === "short" ? m.height * 0.085 : m.height * 0.3;
  const sleeveR = m.armR * fit + 0.008;

  return (
    <group position={[0, bottomY, 0]}>
      <mesh>
        <latheGeometry args={[pts, 44]} />
        <FabricMaterial color={spec.color} metalness={category === "outerwear" ? 0.15 : 0.06} />
      </mesh>
      {sleeveLen > 0 &&
        [1, -1].map((side) => (
          <mesh
            key={`s-${side}`}
            position={[side * (m.shoulderR * 0.82 + m.armR * 0.3), topY - bottomY - m.height * 0.012 - sleeveLen / 2, 0]}
            rotation={[0, 0, side * -0.08]}
          >
            <capsuleGeometry args={[sleeveR, sleeveLen - sleeveR * 1.2, 6, 16]} />
            <FabricMaterial color={spec.color} />
          </mesh>
        ))}
    </group>
  );
}

function Bottoms({ m, spec, fit }: { m: BodyMetrics; spec: GarmentSpec; fit: number }) {
  const skirt = isSkirt(spec.subcategory);
  const shorts = isShorts(spec.subcategory);

  if (skirt) {
    const bottomY = m.kneeY * 0.8;
    const relTop = m.waistY - bottomY;
    const pts = [
      v2(m.waistR * fit + 0.01, relTop),
      v2(m.hipR * fit + 0.012, relTop * 0.6),
      v2(m.hipR * 1.32 * fit + 0.02, 0),
    ];
    return (
      <mesh position={[0, bottomY, 0]}>
        <latheGeometry args={[pts, 44]} />
        <FabricMaterial color={spec.color} />
      </mesh>
    );
  }

  const legLen = shorts ? m.kneeY : m.legL;
  const r = m.legR * fit + 0.008;

  return (
    <group>
      {[1, -1].map((side) => (
        <mesh key={`p-${side}`} position={[side * m.legR * 0.75, legLen / 2, 0]}>
          <capsuleGeometry args={[r, legLen - r * 1.6, 6, 20]} />
          <FabricMaterial color={spec.color} />
        </mesh>
      ))}
      <mesh position={[0, (m.waistY + m.legL) / 2, 0]}>
        <cylinderGeometry args={[m.hipR * fit + 0.012, m.hipR * fit + 0.012, m.waistY - m.legL, 28]} />
        <FabricMaterial color={spec.color} />
      </mesh>
    </group>
  );
}

function Shoes({ m, spec }: { m: BodyMetrics; spec: GarmentSpec }) {
  return (
    <group>
      {[1, -1].map((side) => (
        <mesh key={`shoe-${side}`} position={[side * m.legR * 0.9, m.height * 0.024, m.height * 0.02]}>
          <boxGeometry args={[m.legR * 1.7, m.height * 0.05, m.height * 0.15]} />
          <FabricMaterial color={spec.color} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Accessory({ m, spec, fit }: { m: BodyMetrics; spec: GarmentSpec; fit: number }) {
  const s = (spec.subcategory || "").toLowerCase();
  const color = spec.color;

  if (/sac|bag|tote/.test(s)) {
    return (
      <mesh position={[m.shoulderR + 0.03, m.legL * 0.5, m.height * 0.01]}>
        <boxGeometry args={[m.height * 0.07, m.height * 0.1, m.height * 0.03]} />
        <FabricMaterial color={color} metalness={0.2} />
      </mesh>
    );
  }

  if (/ceinture|belt/.test(s)) {
    return (
      <mesh position={[0, m.waistY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[m.waistR * fit + 0.022, m.height * 0.012, 12, 48]} />
        <FabricMaterial color={color} metalness={0.25} />
      </mesh>
    );
  }

  if (/lunettes|glasses/.test(s)) {
    return (
      <mesh position={[0, m.headCenterY + m.headR * 0.08, m.headR * 0.72]}>
        <boxGeometry args={[m.headR * 1.5, m.headR * 0.16, m.headR * 0.12]} />
        <FabricMaterial color="#111111" metalness={0.4} />
      </mesh>
    );
  }

  if (/chapeau|casquette|hat|cap/.test(s)) {
    return (
      <group position={[0, m.headCenterY + m.headR * 0.6, 0]}>
        <mesh>
          <cylinderGeometry args={[m.headR * 1.4, m.headR * 1.4, m.headR * 0.12, 32]} />
          <FabricMaterial color={color} />
        </mesh>
        <mesh position={[0, m.headR * 0.35, 0]}>
          <cylinderGeometry args={[m.headR * 0.82, m.headR * 0.86, m.headR * 0.7, 32]} />
          <FabricMaterial color={color} />
        </mesh>
      </group>
    );
  }

  if (/montre|watch/.test(s)) {
    return (
      <mesh
        position={[m.shoulderR * 0.82 + m.armR * 0.3, m.shoulderY - m.armL + m.height * 0.02, 0]}
      >
        <boxGeometry args={[m.height * 0.02, m.height * 0.02, m.height * 0.02]} />
        <FabricMaterial color={color} metalness={0.5} />
      </mesh>
    );
  }

  // default: a scarf / neck accent so the colour is visible.
  return (
    <mesh position={[0, m.neckTopY - m.height * 0.008, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[m.neckR * 1.8, m.height * 0.016, 12, 48]} />
      <FabricMaterial color={color} />
    </mesh>
  );
}

// ── dressed avatar ───────────────────────────────────────────────

export function DressedAvatar({
  m,
  items,
  fit,
  hidden,
}: {
  m: BodyMetrics;
  items: GarmentSpec[];
  fit: number;
  hidden: Set<string>;
}) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => layerRank(a.category) - layerRank(b.category)),
    [items]
  );

  return (
    <group>
      <AvatarBody m={m} />
      {sorted.map((spec) => {
        if (hidden.has(spec.key)) return null;
        switch (spec.category) {
          case "tops":
          case "dresses":
          case "outerwear":
            return <TopShell key={spec.key} m={m} spec={spec} fit={fit} />;
          case "bottoms":
            return <Bottoms key={spec.key} m={m} spec={spec} fit={fit} />;
          case "shoes":
            return <Shoes key={spec.key} m={m} spec={spec} />;
          case "accessories":
            return <Accessory key={spec.key} m={m} spec={spec} fit={fit} />;
          default:
            return null;
        }
      })}
    </group>
  );
}
