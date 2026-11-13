"use client";

import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useRef, useState } from "react";
import { MathUtils, NeutralToneMapping, PerspectiveCamera, Vector3 } from "three";
import { LAST_PAGE } from "@/content/site";
import { touchInput } from "@/lib/canvasFonts";
import { useBook } from "@/store/useBook";
import { Book } from "./Book";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./Sheet";

const FOV = 35;
const HALF_TAN = Math.tan(MathUtils.degToRad(FOV / 2));

/** Câmera: enquadra a capa, o spread ou uma página, e aplica zoom com deslocamento. */
function Rig() {
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const look = useRef(new Vector3(0, 0, 0.06));
  const narrow = width < 760 || width / height < 1.1;

  useEffect(() => {
    useBook.getState().setSingle(narrow);
  }, [narrow]);

  useFrame((state, delta) => {
    const { page, half, single, zoom } = useBook.getState();
    const open = page > 0 && page < LAST_PAGE;
    const aspect = width / height;
    const contentWidth = single || !open ? PAGE_WIDTH : PAGE_WIDTH * 2;
    const centerX = single && open ? (half === "left" ? -PAGE_WIDTH / 2 : PAGE_WIDTH / 2) : 0;

    const marginY = height < 640 ? 1.14 : 1.2;
    const fit = Math.max(
      (PAGE_HEIGHT * marginY) / (2 * HALF_TAN),
      (contentWidth * 1.07) / (2 * HALF_TAN * aspect),
    );
    const distance = fit / (zoom ? (single ? 2 : 1.5) : 1);
    const visibleHeight = 2 * HALF_TAN * distance;
    const rangeX = zoom ? Math.max(0, (contentWidth * 1.06 - visibleHeight * aspect) / 2) : 0;
    const rangeY = zoom ? Math.max(0, (PAGE_HEIGHT * 1.12 - visibleHeight) / 2) : 0;

    if (!zoom) touchInput.panX = touchInput.panY = 0;
    const panX = touchInput.active ? touchInput.panX : state.pointer.x;
    const panY = touchInput.active ? touchInput.panY : state.pointer.y;
    const targetX = centerX + panX * rangeX;
    const targetY = panY * rangeY;
    // Sem zoom, um leve paralaxe com o ponteiro dá profundidade à revista.
    const parallax = zoom || touchInput.active ? 0 : 1;

    easing.damp3(
      state.camera.position,
      [targetX + state.pointer.x * 0.05 * parallax, targetY + (0.03 + state.pointer.y * 0.04) * parallax, distance + 0.06],
      0.28,
      delta,
    );
    easing.damp3(look.current, [targetX, targetY - 0.015 * parallax, 0.06], 0.28, delta);
    state.camera.lookAt(look.current);
  });

  return null;
}

function FpsMeter() {
  const frames = useRef(0);
  const last = useRef(0);
  useFrame(() => {
    frames.current++;
    const now = performance.now();
    if (last.current === 0) last.current = now;
    if (now - last.current >= 500) {
      useBook.getState().setFps(Math.round((frames.current * 1000) / (now - last.current)));
      frames.current = 0;
      last.current = now;
    }
  });
  return null;
}

export default function Scene() {
  const [maxDpr] = useState(() => Math.min(2, window.devicePixelRatio || 1));
  const [dpr, setDpr] = useState(maxDpr);
  const [textureScale] = useState(() => (window.innerWidth < 760 ? 1.8 : 2.56));
  const [shadowResolution, setShadowResolution] = useState(512);

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ position: [0, 0.03, 5.2], fov: FOV, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = NeutralToneMapping;
        (camera as PerspectiveCamera).lookAt(0, 0, 0);
      }}
    >
      {/* Se o quadro cair, reduz resolução e sombras em vez de travar. */}
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1);
          setShadowResolution(256);
        }}
        onIncline={() => {
          setDpr(maxDpr);
          setShadowResolution(512);
        }}
      />

      <ambientLight intensity={0.35} />
      <spotLight
        position={[3, 5, 7]}
        angle={0.5}
        penumbra={0.8}
        intensity={2.3}
        decay={0}
        color="#F8FAFC"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[0, 4, 6]} intensity={0.55} color="#94A3B8" />
      <pointLight position={[-4, 2, -2.5]} intensity={1.4} decay={0} color="#10B981" />

      <Environment resolution={256} frames={1} environmentIntensity={0.4}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#10B981" position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[3, 4, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#94A3B8" position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[3, 4, 1]} />
      </Environment>

      <Book textureScale={textureScale} />

      <ContactShadows
        position={[0, -0.93, 0]}
        opacity={0.65}
        scale={12}
        blur={2.4}
        far={4}
        resolution={shadowResolution}
        color="#050508"
      />
      <Rig />
      <FpsMeter />
    </Canvas>
  );
}
