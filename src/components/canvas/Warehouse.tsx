"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, Group, InstancedMesh, Mesh, MeshBasicMaterial, Object3D } from "three";
import { BAYS, LEVELS, slots } from "@/content/warehouse";
import { WAREHOUSE_WINDOW } from "@/faces/estoquento";
import { PH, PW } from "@/lib/surface";
import { AISLES, useDemo } from "@/store/useDemo";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./Sheet";

const BAY = 0.13;
const LEVEL = 0.1;
const AISLE = 0.24;
const SCALE = 0.6;
const RACK_LENGTH = BAYS * BAY;
const HUB = { x: RACK_LENGTH / 2 + 0.16, z: 0 };

const COLORS = { normal: "#E2E8F0", recent: "#10B981", critical: "#F59E0B" };

// Centro da janela do armazém na página esquerda, convertido para o mundo 3D.
const POSITION: [number, number, number] = [
  -PAGE_WIDTH + ((WAREHOUSE_WINDOW.x + WAREHOUSE_WINDOW.w / 2) / PW) * PAGE_WIDTH + 0.03,
  (0.5 - (WAREHOUSE_WINDOW.y + WAREHOUSE_WINDOW.h / 2 + 2) / PH) * PAGE_HEIGHT,
  0.26,
];

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

type Line2 = { material: { dashOffset: number; opacity: number } };

const dummy = new Object3D();
const color = new Color();

export function Warehouse({ active }: { active: boolean }) {
  const root = useRef<Group>(null);
  const boxes = useRef<InstancedMesh>(null);
  const racks = useRef<InstancedMesh>(null);
  const plates = useRef<(Mesh | null)[]>([]);
  const lines = useRef<(Line2 | null)[]>([]);
  const hub = useRef<Mesh>(null);
  const activeSince = useRef<number | null>(null);
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
    if (!active) activeSince.current = null;
    else if (activeSince.current === null) activeSince.current = now;
    // Espera a folha assentar antes de "montar" o armazém sobre a página.
    const shown = activeSince.current !== null && now - activeSince.current > 650;
    easing.damp(root.current.scale, "x", shown ? SCALE : 0, shown ? 0.22 : 0.08, delta);
    root.current.scale.y = root.current.scale.z = root.current.scale.x;
    root.current.visible = root.current.scale.x > 0.004;
    if (!root.current.visible) return;

    const t = state.clock.elapsedTime;
    root.current.rotation.set(0.6 + state.pointer.y * -0.04, -0.75 + Math.sin(t * 0.35) * 0.05 + state.pointer.x * 0.08, 0);

    const demo = useDemo.getState();
    const focus = demo.hoverAisle ?? demo.aisle;
    if (boxes.current && focusPainted.current !== focus) {
      focusPainted.current = focus;
      slots.forEach((slot, i) => {
        color.set(COLORS[slot.status]);
        if (focus !== null && slot.aisle !== focus) color.multiplyScalar(0.28);
        boxes.current!.setColorAt(i, color);
      });
      if (boxes.current.instanceColor) boxes.current.instanceColor.needsUpdate = true;
    }

    const pulseAge = demo.pulse ? (now - demo.pulse.at) / 1300 : 1;
    for (let aisle = 0; aisle < AISLES; aisle++) {
      const plate = plates.current[aisle];
      const pulsing = demo.pulse?.aisle === aisle && pulseAge < 1;
      const target = (focus === aisle ? 0.3 : 0.05) + (pulsing ? (1 - pulseAge) * 0.7 : 0);
      if (plate) easing.damp(plate.material as MeshBasicMaterial, "opacity", target, 0.1, delta);
      const line = lines.current[aisle];
      if (line) {
        line.material.dashOffset -= delta * (pulsing ? 1.6 : 0.25);
        line.material.opacity = pulsing || focus === aisle ? 1 : 0.45;
      }
    }
    if (hub.current) hub.current.scale.setScalar(1 + (pulseAge < 1 ? Math.sin(pulseAge * Math.PI) * 0.8 : 0));
  });

  return (
    <group ref={root} position={POSITION} scale={0} visible={false}>
      {/* Piso */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0.07, -0.004, 0]}
        onPointerMove={(event) => active && event.stopPropagation()}
        onClick={(event) => active && event.stopPropagation()}
      >
        <planeGeometry args={[RACK_LENGTH + 0.46, AISLES * AISLE + 0.14]} />
        <meshStandardMaterial color="#111827" roughness={0.9} metalness={0.1} />
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
          <meshBasicMaterial color="#10B981" transparent opacity={0.05} toneMapped={false} />
        </mesh>
      ))}

      <instancedMesh ref={racks} args={[undefined, undefined, frames.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#475569" roughness={0.45} metalness={0.6} />
      </instancedMesh>

      <instancedMesh
        ref={boxes}
        args={[undefined, undefined, slots.length]}
        onPointerMove={(event) => {
          if (!active || event.instanceId === undefined) return;
          event.stopPropagation();
          useDemo.getState().setHoverAisle(slots[event.instanceId].aisle);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          useDemo.getState().setHoverAisle(null);
          document.body.style.cursor = "auto";
        }}
        onClick={(event) => {
          if (!active || event.instanceId === undefined) return;
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
            lines.current[aisle] = node as unknown as Line2 | null;
          }}
          points={points}
          color="#10B981"
          lineWidth={1.6}
          dashed
          dashSize={0.035}
          gapSize={0.025}
          transparent
          toneMapped={false}
        />
      ))}

      {/* Nó central de sincronização */}
      <mesh position={[HUB.x, 0.02, HUB.z]}>
        <cylinderGeometry args={[0.045, 0.055, 0.04, 24]} />
        <meshStandardMaterial color="#0B1220" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh ref={hub} position={[HUB.x, 0.07, HUB.z]}>
        <sphereGeometry args={[0.022, 20, 20]} />
        <meshBasicMaterial color="#34D399" toneMapped={false} />
      </mesh>
    </group>
  );
}
