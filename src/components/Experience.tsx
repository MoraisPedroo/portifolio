"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { touchInput } from "@/lib/canvasFonts";
import { useBook } from "@/store/useBook";
import { useDemo } from "@/store/useDemo";
import { Hud } from "./ui/Hud";

const Scene = dynamic(() => import("./canvas/Scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
        <span className="mr-2 inline-block size-1.5 animate-pulse rounded-full bg-emerald-500" />
        Montando a revista
      </p>
    </div>
  ),
});

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

/** Campo invisível que recebe a digitação dos campos desenhados na página do crachá. */
function BadgeInput() {
  const focus = useDemo((s) => s.focus);
  const value = useDemo((s) => (s.focus ? s[s.focus] : ""));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focus) ref.current?.focus({ preventScroll: true });
    else ref.current?.blur();
  }, [focus]);

  return (
    <input
      ref={ref}
      aria-label={focus === "role" ? "Cargo no crachá" : "Nome no crachá"}
      className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
      tabIndex={-1}
      value={value}
      onChange={(event) => focus && useDemo.getState().setField(focus, event.target.value)}
      onBlur={() => useDemo.getState().setFocus(null)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === "Escape") useDemo.getState().setFocus(null);
        event.stopPropagation();
      }}
    />
  );
}

export function Experience() {
  const reading = useBook((s) => s.reading);
  const webgl = useBook((s) => s.webgl);
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);

  useEffect(() => {
    if (!hasWebGL()) useBook.setState({ webgl: false, reading: true });
  }, []);

  // Teclado e roda do mouse viram as páginas.
  useEffect(() => {
    if (reading) return;
    let wheelLock = 0;
    let wheelSum = 0;
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      const book = useBook.getState();
      if (["ArrowRight", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        book.next();
      } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        book.prev();
      } else if (event.key === "Home") book.setPage(0);
      else if (event.key === "End") book.setPage(99);
      else if (event.key.toLowerCase() === "z") book.toggleZoom();
      else if (event.key === "Escape" && book.zoom) book.toggleZoom();
    };
    const onWheel = (event: WheelEvent) => {
      const now = performance.now();
      if (now < wheelLock) return;
      wheelSum += event.deltaY + event.deltaX;
      if (Math.abs(wheelSum) < 60) return;
      const book = useBook.getState();
      if (wheelSum > 0) book.next();
      else book.prev();
      wheelSum = 0;
      wheelLock = now + 650;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [reading]);

  if (reading || !webgl) return null;

  return (
    <div
      className="stage fixed inset-0 touch-none select-none overflow-hidden"
      onPointerDown={(event) => {
        touchInput.active = event.pointerType === "touch";
        drag.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (!start || start.id !== event.pointerId || event.pointerType !== "touch") return;
        if (!useBook.getState().zoom) return;
        // Com zoom, arrastar desloca a vista em vez de virar a página.
        const clamp = (v: number) => Math.max(-1, Math.min(1, v));
        touchInput.panX = clamp(touchInput.panX - ((event.clientX - start.x) / window.innerWidth) * 2.4);
        touchInput.panY = clamp(touchInput.panY + ((event.clientY - start.y) / window.innerHeight) * 2.4);
        start.x = event.clientX;
        start.y = event.clientY;
      }}
      onPointerUp={(event) => {
        const start = drag.current;
        drag.current = null;
        if (!start || useBook.getState().zoom) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          if (dx < 0) useBook.getState().next();
          else useBook.getState().prev();
        }
      }}
      onPointerCancel={() => (drag.current = null)}
    >
      <Scene />
      <Hud />
      <BadgeInput />
    </div>
  );
}
