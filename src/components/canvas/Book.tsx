"use client";

import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group } from "three";
import { LAST_PAGE, SHEET_COUNT } from "@/content/site";
import { paintBackCover, paintCredencialLeft, paintCredencialRight } from "@/faces/credencial";
import { paintPrinterLeft, paintPrinterRight } from "@/faces/dpprinter";
import { paintEstoqueLeft, paintEstoqueRight } from "@/faces/estoquento";
import { paintCover, paintEditorial, paintIndex } from "@/faces/intro";
import { fonts, loadFonts } from "@/lib/canvasFonts";
import { PageSurface, Painter } from "@/lib/surface";
import { useBook } from "@/store/useBook";
import { useDemo } from "@/store/useDemo";
import { Badge } from "./Badge";
import { PAGE_WIDTH, Sheet } from "./Sheet";
import { Warehouse } from "./Warehouse";

// Ordem das faces: frente e verso de cada folha, da capa à contracapa.
const PAINTERS: Painter[] = [
  paintCover,
  paintEditorial,
  paintIndex,
  paintPrinterLeft,
  paintPrinterRight,
  paintEstoqueLeft,
  paintEstoqueRight,
  paintCredencialLeft,
  paintCredencialRight,
  paintBackCover,
];

export function Book({ textureScale }: { textureScale: number }) {
  const page = useBook((s) => s.page);
  const root = useRef<Group>(null);

  // Vira uma folha por vez quando o salto é de várias páginas.
  const [shown, setShown] = useState(page);
  useEffect(() => {
    if (shown === page) return;
    const timer = setTimeout(
      () => setShown((current) => current + Math.sign(page - current)),
      Math.abs(page - shown) > 1 ? 130 : 0,
    );
    return () => clearTimeout(timer);
  }, [page, shown]);

  const surfaces = useMemo(
    () => PAINTERS.map((painter) => new PageSurface(painter, fonts, textureScale)),
    [textureScale],
  );
  const pending = useRef(new Set<PageSurface>());

  useEffect(() => {
    const all = () => surfaces.forEach((surface) => pending.current.add(surface));
    all();
    let alive = true;
    loadFonts().then(() => alive && all());
    const unsubscribe = useDemo.subscribe(() => surfaces.forEach((surface) => (surface.dirty = true)));
    return () => {
      alive = false;
      unsubscribe();
      surfaces.forEach((surface) => surface.dispose());
    };
  }, [surfaces]);

  useFrame((_, delta) => {
    const now = performance.now();
    surfaces.forEach((surface, face) => {
      const visible = face === 2 * shown - 1 || face === 2 * shown;
      const forced = pending.current.delete(surface);
      if (forced || (visible && (surface.dirty || surface.animating))) surface.paint(now);
    });
    // Fechada, a revista fica centralizada na capa ou na contracapa.
    const x = shown === 0 ? -PAGE_WIDTH / 2 : shown === LAST_PAGE ? PAGE_WIDTH / 2 : 0;
    if (root.current) easing.damp(root.current.position, "x", x, 0.35, delta);
  });

  return (
    <group ref={root}>
      <group rotation-y={-Math.PI / 2}>
        {Array.from({ length: SHEET_COUNT }, (_, index) => (
          <Sheet
            key={index}
            index={index}
            page={shown}
            front={surfaces[index * 2]}
            back={surfaces[index * 2 + 1]}
          />
        ))}
      </group>
      <Warehouse active={shown === 3 && page === 3} />
      <Badge active={shown === 4 && page === 4} textureScale={textureScale} />
    </group>
  );
}
