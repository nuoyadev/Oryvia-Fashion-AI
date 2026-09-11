"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { DressedAvatar } from "./avatar";
import type { BodyMetrics, GarmentSpec } from "./metrics";

export type BackgroundKey = "dark" | "light" | "sand";

const BACKGROUNDS: Record<BackgroundKey, string> = {
  dark: "#0e0d12",
  light: "#ece8e2",
  sand: "#d9c6a5",
};

export function DressingScene({
  metrics,
  items,
  fit,
  hidden,
  autoRotate,
  background,
}: {
  metrics: BodyMetrics;
  items: GarmentSpec[];
  fit: number;
  hidden: Set<string>;
  autoRotate: boolean;
  background: BackgroundKey;
}) {
  const light = background === "dark";
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0.15, metrics.height * 0.55, metrics.height * 1.15], fov: 38 }}
    >
      <color attach="background" args={[BACKGROUNDS[background]]} />
      <ambientLight intensity={light ? 0.85 : 1.0} />
      <hemisphereLight args={[light ? "#ffffff" : "#ffffff", light ? "#3a3560" : "#d8cbb8", 0.55]} />
      <directionalLight position={[2.5, 3.5, 2]} intensity={light ? 1.5 : 1.1} />
      <directionalLight position={[-2, 1.5, -1]} intensity={0.35} color={light ? "#a78bfa" : "#ffffff"} />

      <group>
        <DressedAvatar m={metrics} items={items} fit={fit} hidden={hidden} />
      </group>

      {/* platform */}
      <mesh position={[0, -0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.012, 64]} />
        <meshStandardMaterial color={light ? "#141318" : "#d6cfc4"} roughness={0.9} />
      </mesh>
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={light ? 0.5 : 0.3}
        scale={6}
        blur={2.6}
        far={2.4}
        color={light ? "#000000" : "#5a4632"}
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={0.9}
        maxDistance={3.4}
        minPolarAngle={0.4}
        maxPolarAngle={Math.PI * 0.62}
        target={[0, metrics.height * 0.52, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={1.4}
      />
    </Canvas>
  );
}
