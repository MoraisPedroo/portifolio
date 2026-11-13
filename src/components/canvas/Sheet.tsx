"use client";

import { ThreeEvent, useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef } from "react";
import {
  Bone,
  BoxGeometry,
  Float32BufferAttribute,
  Group,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  Sphere,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { LAST_PAGE } from "@/content/site";
import { PageSurface } from "@/lib/surface";
import { useBook } from "@/store/useBook";

export const PAGE_WIDTH = 1.28;
export const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / SEGMENTS;
/** Distância entre folhas empilhadas: um pouco maior que a espessura evita z-fighting. */
const STACK_GAP = 0.0045;

/** Quanto a folha sobe na lombada antes de assentar (rad) e em quantos ossos isso se resolve. */
const LIFT = 0.3;
const CURVE_BONES = 9;
const EDGE_REST = 0.03;
const TURN_CURVE = 0.09;

const FRONT = 4;
const BACK = 5;

// Geometria única, compartilhada por todas as folhas: cada vértice é ligado
// a dois ossos vizinhos para a folha curvar sem vincos.
const geometry = (() => {
  const box = new BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, SEGMENTS, 2);
  box.translate(PAGE_WIDTH / 2, 0, 0);
  const position = box.attributes.position;
  const vertex = new Vector3();
  const skinIndex: number[] = [];
  const skinWeight: number[] = [];
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const bone = Math.max(0, Math.min(SEGMENTS - 1, Math.floor(vertex.x / SEGMENT_WIDTH)));
    const weight = Math.min(1, (vertex.x - bone * SEGMENT_WIDTH) / SEGMENT_WIDTH);
    skinIndex.push(bone, bone + 1, 0, 0);
    skinWeight.push(1 - weight, weight, 0, 0);
  }
  box.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndex, 4));
  box.setAttribute("skinWeight", new Float32BufferAttribute(skinWeight, 4));
  return box;
})();

const edgeMaterial = new MeshStandardMaterial({ color: "#E2E8F0", roughness: 0.8 });

function faceMaterial(surface: PageSurface, cover: boolean) {
  return new MeshStandardMaterial({
    map: surface.texture,
    emissive: "#ffffff",
    emissiveMap: surface.texture,
    emissiveIntensity: 0.3,
    roughness: cover ? 0.85 : 0.62,
    metalness: cover ? 0.12 : 0.04,
  });
}

type Props = {
  index: number;
  /** Página corrente já com o atraso por folha aplicado. */
  page: number;
  front: PageSurface;
  back: PageSurface;
};

export function Sheet({ index, page, front, back }: Props) {
  const group = useRef<Group>(null);
  const opened = page > index;
  const closed = page === 0 || page === LAST_PAGE;
  const lastOpened = useRef(opened);
  const turnedAt = useRef(-1e6);
  const skinned = useRef<SkinnedMesh>(null);

  const mesh = useMemo(() => {
    const bones: Bone[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const bone = new Bone();
      bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH;
      if (i > 0) bones[i - 1].add(bone);
      bones.push(bone);
    }
    const skinned = new SkinnedMesh(geometry, [
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      faceMaterial(front, index === 0),
      faceMaterial(back, index === LAST_PAGE - 1),
    ]);
    skinned.castShadow = true;
    skinned.receiveShadow = true;
    skinned.frustumCulled = false;
    // A pose muda a cada quadro; uma esfera fixa e folgada mantém o raycast correto.
    skinned.boundingSphere = new Sphere(new Vector3(0, 0, 0), 4);
    skinned.add(bones[0]);
    skinned.bind(new Skeleton(bones));
    return skinned;
  }, [front, back, index]);

  useEffect(
    () => () => {
      const materials = mesh.material as MeshStandardMaterial[];
      materials[FRONT].dispose();
      materials[BACK].dispose();
    },
    [mesh],
  );

  useFrame((_, delta) => {
    const sheet = skinned.current;
    if (!group.current || !sheet) return;
    const now = performance.now();
    if (lastOpened.current !== opened) {
      turnedAt.current = now;
      lastOpened.current = opened;
    }
    const turn = Math.sin((Math.min(400, now - turnedAt.current) / 400) * Math.PI);
    const dir = opened ? -1 : 1;
    const target = (dir * Math.PI) / 2;
    const bones = sheet.skeleton.bones;

    for (let i = 0; i < bones.length; i++) {
      const node = i === 0 ? group.current : bones[i];
      let rotation = 0;
      if (closed) {
        rotation = i === 0 ? target : 0;
      } else {
        const rest =
          i === 0
            ? dir * (Math.PI / 2 - LIFT)
            : i <= CURVE_BONES
              ? (dir * (LIFT - EDGE_REST)) / CURVE_BONES
              : 0;
        rotation = rest + TURN_CURVE * Math.sin((i * Math.PI) / bones.length) * turn * target;
      }
      easing.dampAngle(node.rotation, "y", rotation, 0.5, delta);
      const fold = i > 8 && !closed ? Math.sin((i * Math.PI) / bones.length - 0.5) * turn * dir * 0.035 : 0;
      easing.dampAngle(node.rotation, "x", fold, 0.3, delta);
    }
    sheet.position.z = (page - index) * STACK_GAP;
  });

  const surfaceOf = (event: ThreeEvent<MouseEvent>) => {
    const material = event.face?.materialIndex;
    return material === FRONT ? front : material === BACK ? back : null;
  };

  const hitOf = (event: ThreeEvent<MouseEvent>) => {
    const surface = surfaceOf(event);
    if (!surface || !event.uv) return null;
    return surface.hitAt(event.uv.x * surface.width, (1 - event.uv.y) * surface.height);
  };

  return (
    <group
      ref={group}
      rotation-y={Math.PI / 2}
      onPointerMove={(event) => {
        event.stopPropagation();
        const surface = surfaceOf(event);
        const hit = hitOf(event);
        front.setHover(surface === front ? (hit?.id ?? null) : null);
        back.setHover(surface === back ? (hit?.id ?? null) : null);
        document.body.style.cursor = hit || closed ? "pointer" : "auto";
      }}
      onPointerOut={() => {
        front.setHover(null);
        back.setHover(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (event.delta > 6) return; // foi um arrasto, não um clique
        const hit = hitOf(event);
        if (hit) return hit.onClick();
        const book = useBook.getState();
        if (book.page === 0) book.next();
        else if (book.page === LAST_PAGE) book.prev();
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        if (!hitOf(event) && !closed) useBook.getState().toggleZoom();
      }}
    >
      <primitive ref={skinned} object={mesh} />
    </group>
  );
}
