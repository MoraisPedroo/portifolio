"use client";

import { PerformanceMonitor, View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { NeutralToneMapping } from "three";

/**
 * Um único contexto WebGL para a página inteira. Cada palco 3D é um <View>
 * posicionado no fluxo normal do HTML; o canvas fixo desenha cada um no
 * recorte do seu elemento e pula os que estão fora da tela.
 */
export default function SharedCanvas() {
  const [maxDpr] = useState(() => Math.min(2, window.devicePixelRatio || 1));
  const [dpr, setDpr] = useState(maxDpr);

  return (
    <Canvas
      eventSource={document.body}
      eventPrefix="client"
      dpr={dpr}
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = NeutralToneMapping;
      }}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 20 }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(maxDpr)} />
      <View.Port />
    </Canvas>
  );
}
