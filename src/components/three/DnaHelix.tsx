import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HelixProps {
  /** 0..1 normalized scroll progress driving rotation + morph. */
  progress: number;
}

/**
 * A glowing double-helix made of two phase-shifted strands of small
 * spheres connected by "rungs". Rotates and stretches with scroll —
 * thematic for healthcare/genomics + the project's electric-teal palette.
 */
const Helix = ({ progress }: HelixProps) => {
  const group = useRef<THREE.Group>(null);
  const rung = useRef<THREE.InstancedMesh>(null);
  const strandA = useRef<THREE.InstancedMesh>(null);
  const strandB = useRef<THREE.InstancedMesh>(null);

  const COUNT = 60;
  const RADIUS = 1.1;
  const HEIGHT = 6;

  // Stable per-instance dummy object reused for matrix updates.
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Teal primary glow color.
  const tealA = useMemo(() => new THREE.Color("#00D4B1"), []);
  const tealB = useMemo(() => new THREE.Color("#10B981"), []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // Continuous gentle spin + scroll-driven boost.
    group.current.rotation.y = t * 0.15 + progress * Math.PI * 1.8;
    group.current.rotation.x = Math.sin(t * 0.4) * 0.08 + progress * 0.35;
    group.current.position.y = -progress * 0.6;

    // Stretch the helix slightly as user scrolls.
    const scaleY = 1 + progress * 0.25;
    group.current.scale.set(1, scaleY, 1);

    if (!strandA.current || !strandB.current || !rung.current) return;

    for (let i = 0; i < COUNT; i++) {
      const y = (i / (COUNT - 1)) * HEIGHT - HEIGHT / 2;
      const angle = (i / COUNT) * Math.PI * 4 + t * 0.3;

      // Strand A
      const ax = Math.cos(angle) * RADIUS;
      const az = Math.sin(angle) * RADIUS;
      dummy.position.set(ax, y, az);
      const pulse = 0.07 + Math.sin(t * 2 + i * 0.4) * 0.02;
      dummy.scale.setScalar(pulse);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      strandA.current.setMatrixAt(i, dummy.matrix);

      // Strand B (phase shifted by π)
      const bx = Math.cos(angle + Math.PI) * RADIUS;
      const bz = Math.sin(angle + Math.PI) * RADIUS;
      dummy.position.set(bx, y, bz);
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      strandB.current.setMatrixAt(i, dummy.matrix);

      // Rung (cylinder) connecting both strands every other index for clarity.
      dummy.position.set((ax + bx) / 2, y, (az + bz) / 2);
      const dx = bx - ax;
      const dz = bz - az;
      const length = Math.sqrt(dx * dx + dz * dz);
      dummy.scale.set(0.012, length / 2, 0.012);
      dummy.rotation.set(0, Math.atan2(dz, dx), Math.PI / 2);
      dummy.updateMatrix();
      rung.current.setMatrixAt(i, dummy.matrix);
    }
    strandA.current.instanceMatrix.needsUpdate = true;
    strandB.current.instanceMatrix.needsUpdate = true;
    rung.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={strandA} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={tealA}
          emissive={tealA}
          emissiveIntensity={1.6}
          roughness={0.25}
          metalness={0.4}
        />
      </instancedMesh>
      <instancedMesh ref={strandB} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={tealB}
          emissive={tealB}
          emissiveIntensity={1.4}
          roughness={0.25}
          metalness={0.4}
        />
      </instancedMesh>
      <instancedMesh ref={rung} args={[undefined, undefined, COUNT]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshBasicMaterial color={tealA} transparent opacity={0.35} />
      </instancedMesh>
    </group>
  );
};

interface DnaHelixProps {
  progress: number;
  className?: string;
}

export const DnaHelix = ({ progress, className }: DnaHelixProps) => (
  <div className={className}>
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#00D4B1" />
      <pointLight position={[-5, -3, -2]} intensity={0.8} color="#10B981" />
      <Helix progress={progress} />
    </Canvas>
  </div>
);