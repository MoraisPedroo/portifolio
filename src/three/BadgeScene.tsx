"use client";

import { ContactShadows, Environment, Lightformer, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef } from "react";
import { Color, ExtrudeGeometry, Group, Path, ShaderMaterial, Shape, Texture, Vector2 } from "three";
import { fonts, loadFonts } from "@/lib/canvasFonts";
import { PageSurface } from "@/lib/surface";
import { useDemo } from "@/store/useDemo";
import { CARD_H, CARD_W, paintCardBack, paintCardFront } from "./badgeFaces";

const HEIGHT = 1.5;
const WIDTH = HEIGHT * (CARD_W / CARD_H);
const DEPTH = 0.022;
const RADIUS = 0.065;
/** Fenda da presilha, no topo do cartão. */
const SLOT = { y: HEIGHT / 2 - 0.058, w: 0.16, h: 0.034 };

/** Acabamentos de laminação: intensidade, tinta do filme e densidade de flocos. */
const FINISHES = [
  { iridescence: 1.0, tint: new Color(1, 1, 1), tintMix: 0.0, flakes: 1.0 },
  { iridescence: 0.95, tint: new Color(0.06, 0.82, 0.55), tintMix: 0.82, flakes: 0.7 },
  { iridescence: 0.85, tint: new Color(0.82, 0.86, 0.92), tintMix: 0.94, flakes: 1.5 },
];

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// Laminação holográfica: Fresnel + interferência de película fina + flocos metálicos.
const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uSize;
  uniform float uRadius;
  uniform vec4 uSlot;
  uniform vec2 uTilt;
  uniform float uIridescence;
  uniform vec3 uTint;
  uniform float uTintMix;
  uniform float uFlakes;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float roundedRect(vec2 p, vec2 halfSize, float r) {
    vec2 q = abs(p) - halfSize + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  vec3 thinFilm(float cosTheta, float shift) {
    float thickness = 380.0 + 440.0 * (1.0 - cosTheta);
    float phase = 6.28318 * thickness * 0.01 + shift;
    return 0.5 + 0.5 * vec3(sin(phase), sin(phase + 2.094), sin(phase + 4.188));
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    if (roundedRect(p, uSize * 0.5, uRadius) > 0.0) discard;
    if (roundedRect(p - uSlot.xy, uSlot.zw, uSlot.w) < 0.0) discard;

    vec3 base = texture2D(uMap, vUv).rgb;
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float cosTheta = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = 0.04 + 0.96 * pow(1.0 - cosTheta, 5.0);

    vec2 cell = floor(vUv * uSize * 260.0);
    float h1 = hash(cell);
    float h2 = hash(cell + 17.0);
    vec3 flakeNormal = normalize(N + (vec3(h1, h2, 0.5) - 0.5) * 0.9);
    vec3 lightDir = normalize(V + vec3(uTilt * 1.6, 0.0));
    float sparkle = pow(clamp(dot(flakeNormal, lightDir), 0.0, 1.0), 48.0) * step(0.5, h1);

    float shift = uTilt.x * 5.0 + uTilt.y * 3.5 + (vUv.x + vUv.y) * 3.2 + h2 * 0.5;
    vec3 film = mix(thinFilm(cosTheta, shift), uTint, uTintMix);

    float sweep = fract(vUv.x * 0.7 + vUv.y * 0.55 + uTilt.x * 1.4 + uTilt.y * 0.9);
    float band = smoothstep(0.32, 0.0, abs(sweep - 0.5));

    // Áreas escuras da arte recebem menos filme, para o texto continuar legível.
    float luma = dot(base, vec3(0.299, 0.587, 0.114));
    float coverage = 0.4 + 0.6 * smoothstep(0.0, 0.5, luma);
    float holo = uIridescence * coverage * (0.08 + 0.3 * band + 0.5 * fresnel);
    vec3 color = base * (0.86 + 0.14 * cosTheta);
    color += film * holo * (0.65 + 0.35 * h1);
    color += film * sparkle * uIridescence * uFlakes * coverage * 0.9;

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function cardMaterial(map: Texture) {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uMap: { value: map },
      uSize: { value: new Vector2(WIDTH, HEIGHT) },
      uRadius: { value: RADIUS },
      uSlot: { value: [0, SLOT.y, SLOT.w / 2, SLOT.h / 2] },
      uTilt: { value: new Vector2() },
      uIridescence: { value: 1 },
      uTint: { value: new Color(1, 1, 1) },
      uTintMix: { value: 0 },
      uFlakes: { value: 1 },
    },
  });
}

function roundedRectPath<T extends Shape | Path>(target: T, cx: number, cy: number, w: number, h: number, r: number) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  target.moveTo(x + r, y);
  target.lineTo(x + w - r, y);
  target.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  target.lineTo(x + w, y + h - r);
  target.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  target.lineTo(x + r, y + h);
  target.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  target.lineTo(x, y + r);
  target.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return target;
}

function Badge() {
  const card = useRef<Group>(null);
  const spin = useRef(0);

  const { front, back, frontMaterial, backMaterial, body } = useMemo(() => {
    const scale = Math.min(3, Math.max(2, window.devicePixelRatio * 1.5));
    const front = new PageSurface(paintCardFront, fonts, scale, CARD_W, CARD_H);
    const back = new PageSurface(paintCardBack, fonts, scale, CARD_W, CARD_H);
    const shape = roundedRectPath(new Shape(), 0, 0, WIDTH, HEIGHT, RADIUS);
    shape.holes.push(roundedRectPath(new Path(), 0, SLOT.y, SLOT.w, SLOT.h, SLOT.h / 2));
    const body = new ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false, curveSegments: 12 });
    body.translate(0, 0, -DEPTH / 2);
    return { front, back, body, frontMaterial: cardMaterial(front.texture), backMaterial: cardMaterial(back.texture) };
  }, []);

  useEffect(() => {
    const repaint = () => {
      front.dirty = true;
      back.dirty = true;
    };
    let alive = true;
    loadFonts().then(() => alive && repaint());
    const unsubscribe = useDemo.subscribe(repaint);
    return () => {
      alive = false;
      unsubscribe();
      front.dispose();
      back.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
      body.dispose();
    };
  }, [front, back, frontMaterial, backMaterial, body]);

  useFrame((state, delta) => {
    if (!card.current) return;
    const now = performance.now();
    if (front.dirty) front.paint(now);
    if (back.dirty) back.paint(now);

    const demo = useDemo.getState();
    const t = state.clock.elapsedTime;
    // Inclina com o ponteiro; sem ponteiro, balança devagar.
    const tiltY = state.pointer.x * 0.55 + Math.sin(t * 0.6) * 0.16;
    const tiltX = -state.pointer.y * 0.3 + Math.cos(t * 0.5) * 0.06;
    easing.damp(spin, "current", demo.flipped ? Math.PI : 0, 0.32, delta);
    easing.dampE(card.current.rotation, [tiltX, tiltY + spin.current, Math.sin(t * 0.4) * 0.02], 0.2, delta);
    card.current.position.y = Math.sin(t * 0.9) * 0.02;

    const finish = FINISHES[demo.finish];
    const k = Math.min(1, delta * 6);
    for (const material of [frontMaterial, backMaterial]) {
      const u = material.uniforms;
      u.uTilt.value.set(tiltY, tiltX);
      u.uIridescence.value += (finish.iridescence - u.uIridescence.value) * k;
      u.uTintMix.value += (finish.tintMix - u.uTintMix.value) * k;
      u.uFlakes.value += (finish.flakes - u.uFlakes.value) * k;
      (u.uTint.value as Color).lerp(finish.tint, k);
    }
  });

  return (
    <group ref={card}>
      {/* Fita e presilha */}
      <mesh position={[0, HEIGHT / 2 + 0.62, -0.004]}>
        <planeGeometry args={[0.13, 1.1]} />
        <meshStandardMaterial color="#2A1F5C" roughness={0.7} side={2} />
      </mesh>
      <mesh position={[0, HEIGHT / 2 + 0.03, 0]}>
        <boxGeometry args={[0.2, 0.06, 0.03]} />
        <meshStandardMaterial color="#C9CFD8" roughness={0.25} metalness={1} />
      </mesh>
      <mesh position={[0, SLOT.y + 0.04, 0]}>
        <boxGeometry args={[0.07, 0.12, 0.012]} />
        <meshStandardMaterial color="#AEB6C2" roughness={0.3} metalness={1} />
      </mesh>

      <mesh geometry={body} castShadow>
        <meshStandardMaterial color="#EEF1F5" roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh position-z={DEPTH / 2 + 0.0008} material={frontMaterial}>
        <planeGeometry args={[WIDTH, HEIGHT]} />
      </mesh>
      <mesh position-z={-DEPTH / 2 - 0.0008} rotation-y={Math.PI} material={backMaterial}>
        <planeGeometry args={[WIDTH, HEIGHT]} />
      </mesh>
    </group>
  );
}

export function BadgeScene() {
  return (
    <>
      <PerspectiveCamera makeDefault fov={28} position={[0, 0.05, 4.4]} />
      <ambientLight intensity={0.5} />
      <spotLight position={[2.5, 3, 4]} angle={0.5} penumbra={0.9} intensity={40} castShadow />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 3, 2]} rotation-x={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={2} color="#34D399" position={[-3, 0.5, 1]} rotation-y={Math.PI / 2} scale={2} />
        <Lightformer form="rect" intensity={2.5} color="#9B7BFF" position={[3, 0, 1]} rotation-y={-Math.PI / 2} scale={[3, 4, 1]} />
      </Environment>
      <Badge />
      <ContactShadows position={[0, -1.05, 0]} opacity={0.45} scale={4} blur={2.6} far={1.6} resolution={256} color="#000000" />
    </>
  );
}
