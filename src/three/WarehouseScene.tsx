"use client";

import { ContactShadows, Line, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, Group, InstancedMesh, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera as Camera } from "three";
import { BAYS, LEVELS, slots } from "@/content/warehouse";
import { AISLES, useDemo } from "@/store/useDemo";

const BAY = 0.13;
const LEVEL = 0.1;
const AISLE = 0.24;
const RACK_LENGTH = BAYS * BAY;
const HUB = { x: RACK_LENGTH / 2 + 0.18, z: 0 };

const COLORS = { normal: "#E6EAF0", recent: "#10B981", critical: "#F5A524" };
const ORANGE = "#F26A1B";

const aisleZ = (aisle: number) => (aisle - (AISLES - 1) / 2) * AISLE;
const bayX = (bay: number) => (bay - (BAYS - 1) / 2) * BAY;

/** Estrutura metálica: prateleiras e colunas de cada corredor. */
const frames = (() => {
  const list: { position: [number, number, number]; scale: [number, number, number] }[] = [];
  for (let aisle = 0; aisle < AISLES; aisle++) {
    const z = aisleZ(aisle);
    for (let level = 0; level <= LEVELS; level++) {
      list.push({ position: [0, level * LEVEL + 0.004, z], scale: [RACK_LENGTH + 0.02, 0.006, 0.13] });
    }
    for (let post = 0; post <= BAYS; post++) {
      for (const side of [-1, 1]) {
        list.push({
          position: [(post - BAYS / 2) * BAY, (LEVELS * LEVEL) / 2, z + side * 0.062],
          scale: [0.008, LEVELS * LEVEL + 0.01, 0.008],
        });
      }
    }
  }
  return list;
})();

type DashedLine = { material: { dashOffset: number; opacity: number } };

const dummy = new Object3D();
const color = new Color();

function Warehouse() {
  const root = useRef<Group>(null);
  const boxes = useRef<InstancedMesh>(null);
  const racks = useRef<InstancedMesh>(null);
  const plates = useRef<(Mesh | null)[]>([]);
  const lines = useRef<(DashedLine | null)[]>([]);
  const hub = useRef<Mesh>(null);
  const focusPainted = useRef<number | null | undefined>(undefined);

  const wires = useMemo(
    () =>
      Array.from({ length: AISLES }, (_, aisle) => {
        const z = aisleZ(aisle);
        return [
          [RACK_LENGTH / 2 + 0.02, 0.006, z],
          [HUB.x, 0.006, z],
          [HUB.x, 0.006, HUB.z],
        ] as [number, number, number][];
      }),
    [],
  );

  useLayoutEffect(() => {
    if (racks.current) {
      frames.forEach((frame, i) => {
        dummy.position.set(...frame.position);
        dummy.scale.set(...frame.scale);
        dummy.updateMatrix();
        racks.current!.setMatrixAt(i, dummy.matrix);
      });
      racks.current.instanceMatrix.needsUpdate = true;
    }
    if (boxes.current) {
      slots.forEach((slot, i) => {
        dummy.position.set(bayX(slot.bay), slot.level * LEVEL + 0.046, aisleZ(slot.aisle));
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        boxes.current!.setMatrixAt(i, dummy.matrix);
      });
      boxes.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  useFrame((state, delta) => {
    if (!root.current) return;
    const now = performance.now();
    const t = state.clock.elapsedTime;
    easing.dampE(
      root.current.rotation,
      [0, Math.sin(t * 0.25) * 0.12 + state.pointer.x * 0.18, 0],
      0.4,
      delta,
    );

    const demo = useDemo.getState();
    const focus = demo.hoverAisle ?? demo.aisle;
    if (boxes.current && focusPainted.current !== focus) {
      focusPainted.current = focus;
      slots.forEach((slot, i) => {
        color.set(COLORS[slot.status]);
        if (focus !== null && slot.aisle !== focus) color.multiplyScalar(0.25);
        boxes.current!.setColorAt(i, color);
      });
      if (boxes.current.instanceColor) boxes.current.instanceColor.needsUpdate = true;
    }

    const pulseAge = demo.pulse ? (now - demo.pulse.at) / 1300 : 1;
    for (let aisle = 0; aisle < AISLES; aisle++) {
      const plate = plates.current[aisle];
      const pulsing = demo.pulse?.aisle === aisle && pulseAge < 1;
      const target = (focus === aisle ? 0.32 : 0.05) + (pulsing ? (1 - pulseAge) * 0.7 : 0);
      if (plate) easing.damp(plate.material as MeshBasicMaterial, "opacity", target, 0.1, delta);
      const line = lines.current[aisle];
      if (line) {
        line.material.dashOffset -= delta * (pulsing ? 1.6 : 0.25);
        line.material.opacity = pulsing || focus === aisle ? 1 : 0.4;
      }
    }
    if (hub.current) hub.current.scale.setScalar(1 + (pulseAge < 1 ? Math.sin(pulseAge * Math.PI) * 0.8 : 0));
  });

  return (
    <group ref={root}>
      <mesh rotation-x={-Math.PI / 2} position={[0.08, -0.004, 0]} receiveShadow>
        <planeGeometry args={[RACK_LENGTH + 0.5, AISLES * AISLE + 0.16]} />
        <meshStandardMaterial color="#1A202A" roughness={0.85} metalness={0.1} />
      </mesh>

      {Array.from({ length: AISLES }, (_, aisle) => (
        <mesh
          key={aisle}
          ref={(node) => {
            plates.current[aisle] = node;
          }}
          rotation-x={-Math.PI / 2}
          position={[0, 0.001, aisleZ(aisle)]}
        >
          <planeGeometry args={[RACK_LENGTH + 0.08, AISLE - 0.05]} />
          <meshBasicMaterial color={ORANGE} transparent opacity={0.05} toneMapped={false} />
        </mesh>
      ))}

      <instancedMesh ref={racks} args={[undefined, undefined, frames.length]} castShadow>
        <boxGeometry />
        <meshStandardMaterial color="#8A94A3" roughness={0.45} metalness={0.25} />
      </instancedMesh>

      <instancedMesh
        ref={boxes}
        args={[undefined, undefined, slots.length]}
        castShadow
        onPointerMove={(event) => {
          if (event.instanceId === undefined) return;
          event.stopPropagation();
          useDemo.getState().setHoverAisle(slots[event.instanceId].aisle);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          useDemo.getState().setHoverAisle(null);
          document.body.style.cursor = "";
        }}
        onClick={(event) => {
          if (event.instanceId === undefined) return;
          event.stopPropagation();
          useDemo.getState().toggleAisle(slots[event.instanceId].aisle);
        }}
      >
        <boxGeometry args={[0.1, 0.078, 0.11]} />
        <meshStandardMaterial roughness={0.55} metalness={0.05} />
      </instancedMesh>

      {wires.map((points, aisle) => (
        <Line
          key={aisle}
          ref={(node) => {
            lines.current[aisle] = node as unknown as DashedLine | null;
          }}
          points={points}
          color={ORANGE}
          lineWidth={1.8}
          dashed
          dashSize={0.035}
          gapSize={0.025}
          transparent
          toneMapped={false}
        />
      ))}

      <mesh position={[HUB.x, 0.02, HUB.z]}>
        <cylinderGeometry args={[0.045, 0.055, 0.04, 24]} />
        <meshStandardMaterial color="#0B1220" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh ref={hub} position={[HUB.x, 0.07, HUB.z]}>
        <sphereGeometry args={[0.022, 20, 20]} />
        <meshBasicMaterial color="#FF9A5C" toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Enquadra o armazém de acordo com a proporção do palco. */
function Rig() {
  const camera = useRef<Camera>(null);
  useFrame((state) => {
    if (!camera.current) return;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const distance = aspect < 1 ? 3.2 : aspect < 1.4 ? 2.6 : 2.25;
    camera.current.position.set(distance * 0.72, distance * 0.62, distance * 0.78);
    camera.current.lookAt(0.06, 0.08, 0);
  });
  return <PerspectiveCamera ref={camera} makeDefault fov={30} near={0.05} far={30} />;
}

export function WarehouseScene() {
  return (
    <>
      <Rig />
      <hemisphereLight args={["#ffffff", "#1a202a", 1.1]} />
      <directionalLight
        position={[2.5, 4, 2]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-left={-1.2}
        shadow-camera-right={1.2}
        shadow-camera-top={1.2}
        shadow-camera-bottom={-1.2}
      />
      <Warehouse />
      <ContactShadows position={[0.08, -0.006, 0]} opacity={0.5} scale={3} blur={2.2} far={0.8} resolution={256} color="#000000" />
    </>
  );
}
