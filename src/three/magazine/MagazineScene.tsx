"use client";

import { ContactShadows, Environment, Lightformer, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, MathUtils, PerspectiveCamera as Camera } from "three";
import { fonts, loadFonts } from "@/lib/canvasFonts";
import { PageSurface } from "@/lib/surface";
import { MAG_LAST, MAG_SHEETS, useMagazine } from "@/store/useMagazine";
import { onImageLoad, preloadImages } from "../images";
import { MAGAZINE_PAGES } from "./pages";
import { PAGE_HEIGHT, PAGE_WIDTH, Sheet } from "./Sheet";

const FOV = 30;
const HALF_TAN = Math.tan(MathUtils.degToRad(FOV / 2));

/** Enquadra a capa fechada ou a revista aberta, conforme a proporção do palco. */
function Rig({ open }: { open: boolean }) {
  const camera = useRef<Camera>(null);
  const distance = useRef(6);
  useFrame((state, delta) => {
    if (!camera.current) return;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const width = open ? PAGE_WIDTH * 2 : PAGE_WIDTH;
    const fit = Math.max((PAGE_HEIGHT * 1.16) / (2 * HALF_TAN), (width * 1.1) / (2 * HALF_TAN * aspect));
    easing.damp(distance, "current", fit, 0.35, delta);
    camera.current.position.set(state.pointer.x * 0.12, 0.05 + state.pointer.y * 0.08, distance.current);
    camera.current.lookAt(0, 0, 0);
  });
  return <PerspectiveCamera ref={camera} makeDefault fov={FOV} near={0.1} far={40} position={[0, 0, 6]} />;
}

export function MagazineScene() {
  const page = useMagazine((s) => s.page);
  const root = useRef<Group>(null);

  // Vira uma folha por vez quando o salto é de várias páginas.
  const [shown, setShown] = useState(page);
  useEffect(() => {
    if (shown === page) return;
    const timer = setTimeout(
      () => setShown((current) => current + Math.sign(page - current)),
      Math.abs(page - shown) > 1 ? 260 : 0,
    );
    return () => clearTimeout(timer);
  }, [page, shown]);

  const surfaces = useMemo(() => {
    const scale = Math.min(2.4, Math.max(1.6, window.devicePixelRatio * 1.2));
    return MAGAZINE_PAGES.map((painter) => new PageSurface(painter, fonts, scale));
  }, []);

  useEffect(() => {
    const repaint = () => surfaces.forEach((surface) => (surface.dirty = true));
    let alive = true;
    preloadImages();
    loadFonts().then(() => alive && repaint());
    const off = onImageLoad(repaint);
    return () => {
      alive = false;
      off();
      surfaces.forEach((surface) => surface.dispose());
    };
  }, [surfaces]);

  useFrame((state, delta) => {
    const now = performance.now();
    surfaces.forEach((surface) => {
      if (surface.dirty) surface.paint(now);
    });
    if (!root.current) return;
    // Fechada, a revista fica centralizada na capa ou na contracapa.
    const x = shown === 0 ? -PAGE_WIDTH / 2 : shown === MAG_LAST ? PAGE_WIDTH / 2 : 0;
    easing.damp(root.current.position, "x", x, 0.35, delta);
    easing.dampE(root.current.rotation, [-0.22 - state.pointer.y * 0.05, -0.08 + state.pointer.x * 0.1, 0], 0.5, delta);
  });

  const flip = () => useMagazine.getState().next();

  return (
    <>
      <Rig open={shown > 0 && shown < MAG_LAST} />
      <ambientLight intensity={0.55} />
      <spotLight position={[2.5, 4, 6]} angle={0.5} penumbra={0.8} intensity={60} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0002} />
      <Environment resolution={128} frames={1} environmentIntensity={0.4}>
        <Lightformer form="rect" intensity={2} position={[0, 4, 3]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#10B981" position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[3, 4, 1]} />
      </Environment>
      <group ref={root}>
        <group rotation-y={-Math.PI / 2}>
          {Array.from({ length: MAG_SHEETS }, (_, index) => (
            <Sheet
              key={index}
              index={index}
              page={shown}
              last={MAG_LAST}
              front={surfaces[index * 2]}
              back={surfaces[index * 2 + 1]}
              onFlip={flip}
            />
          ))}
        </group>
      </group>
      <ContactShadows position={[0, -PAGE_HEIGHT / 2 - 0.08, 0]} opacity={0.4} scale={7} blur={2.6} far={2} resolution={256} color="#0E1116" />
    </>
  );
}
