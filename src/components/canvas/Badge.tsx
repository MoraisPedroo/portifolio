"use client";

import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef } from "react";
import { Color, ExtrudeGeometry, Group, ShaderMaterial, Shape, Texture, Vector2 } from "three";
import { BADGE_CENTER, CARD_H, CARD_W, paintCardBack, paintCardFront } from "@/faces/credencial";
import { fonts, loadFonts } from "@/lib/canvasFonts";
import { PH, PW, PageSurface } from "@/lib/surface";
import { useDemo } from "@/store/useDemo";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./Sheet";

const HEIGHT = 0.78;
const WIDTH = HEIGHT * (CARD_W / CARD_H);
const DEPTH = 0.012;
const RADIUS = 0.034;

const POSITION: [number, number, number] = [
  (BADGE_CENTER.x / PW) * PAGE_WIDTH - 0.015,
  (0.5 - BADGE_CENTER.y / PH) * PAGE_HEIGHT,
  0.3,
];

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

    vec3 base = texture2D(uMap, vUv).rgb;
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float cosTheta = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = 0.04 + 0.96 * pow(1.0 - cosTheta, 5.0);

    // Flocos: cada célula tem uma micro-normal própria e cintila em ângulos diferentes.
    vec2 cell = floor(vUv * uSize * 420.0);
    float h1 = hash(cell);
    float h2 = hash(cell + 17.0);
    vec3 flakeNormal = normalize(N + (vec3(h1, h2, 0.5) - 0.5) * 0.9);
    vec3 lightDir = normalize(V + vec3(uTilt * 1.6, 0.0));
    float sparkle = pow(clamp(dot(flakeNormal, lightDir), 0.0, 1.0), 48.0) * step(0.5, h1);

    float shift = uTilt.x * 5.0 + uTilt.y * 3.5 + (vUv.x + vUv.y) * 3.2 + h2 * 0.5;
    vec3 film = mix(thinFilm(cosTheta, shift), uTint, uTintMix);

    // Faixa diagonal que varre o cartão conforme a inclinação.
    float sweep = fract(vUv.x * 0.7 + vUv.y * 0.55 + uTilt.x * 1.4 + uTilt.y * 0.9);
    float band = smoothstep(0.32, 0.0, abs(sweep - 0.5));

    // Áreas escuras da arte recebem menos filme, para o texto continuar legível.
    float luma = dot(base, vec3(0.299, 0.587, 0.114));
    float coverage = 0.4 + 0.6 * smoothstep(0.0, 0.5, luma);
    float holo = uIridescence * coverage * (0.10 + 0.34 * band + 0.55 * fresnel);
    vec3 color = base * (0.84 + 0.16 * cosTheta);
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
      uTilt: { value: new Vector2() },
      uIridescence: { value: 1 },
      uTint: { value: new Color(1, 1, 1) },
      uTintMix: { value: 0 },
      uFlakes: { value: 1 },
    },
  });
}

export function Badge({ active, textureScale }: { active: boolean; textureScale: number }) {
  const root = useRef<Group>(null);
  const card = useRef<Group>(null);
  const activeSince = useRef<number | null>(null);
  const spin = useRef(0);

  const { front, back, frontMaterial, backMaterial, body } = useMemo(() => {
    const scale = textureScale > 2 ? 3 : 2;
    const front = new PageSurface(paintCardFront, fonts, scale, CARD_W, CARD_H);
    const back = new PageSurface(paintCardBack, fonts, scale, CARD_W, CARD_H);
    const shape = new Shape();
    const w = WIDTH / 2;
    const h = HEIGHT / 2;
    shape.moveTo(-w + RADIUS, -h);
    shape.lineTo(w - RADIUS, -h);
    shape.absarc(w - RADIUS, -h + RADIUS, RADIUS, -Math.PI / 2, 0, false);
    shape.lineTo(w, h - RADIUS);
    shape.absarc(w - RADIUS, h - RADIUS, RADIUS, 0, Math.PI / 2, false);
    shape.lineTo(-w + RADIUS, h);
    shape.absarc(-w + RADIUS, h - RADIUS, RADIUS, Math.PI / 2, Math.PI, false);
    shape.lineTo(-w, -h + RADIUS);
    shape.absarc(-w + RADIUS, -h + RADIUS, RADIUS, Math.PI, Math.PI * 1.5, false);
    const body = new ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false, curveSegments: 10 });
    body.translate(0, 0, -DEPTH / 2);
    return {
      front,
      back,
      body,
      frontMaterial: cardMaterial(front.texture),
      backMaterial: cardMaterial(back.texture),
    };
  }, [textureScale]);

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
    if (!root.current || !card.current) return;
    const now = performance.now();
    if (front.dirty) front.paint(now);
    if (back.dirty) back.paint(now);

    if (!active) activeSince.current = null;
    else if (activeSince.current === null) activeSince.current = now;
    const shown = activeSince.current !== null && now - activeSince.current > 650;
    easing.damp(root.current.scale, "x", shown ? 1 : 0, shown ? 0.22 : 0.08, delta);
    root.current.scale.y = root.current.scale.z = root.current.scale.x;
    root.current.visible = root.current.scale.x > 0.004;
    if (!root.current.visible) return;

    const demo = useDemo.getState();
    const t = state.clock.elapsedTime;
    // Inclinação: segue o ponteiro, com um balanço lento para telas de toque.
    const tiltY = state.pointer.x * 0.5 + Math.sin(t * 0.7) * 0.14;
    const tiltX = -state.pointer.y * 0.32 + Math.cos(t * 0.55) * 0.07;
    easing.damp(spin, "current", demo.flipped ? Math.PI : 0, 0.3, delta);
    easing.dampE(card.current.rotation, [tiltX, tiltY + spin.current, 0], 0.18, delta);
    card.current.position.y = Math.sin(t * 0.9) * 0.012;

    const finish = FINISHES[demo.finish];
    for (const material of [frontMaterial, backMaterial]) {
      const u = material.uniforms;
      u.uTilt.value.set(tiltY, tiltX);
      u.uIridescence.value += (finish.iridescence - u.uIridescence.value) * Math.min(1, delta * 6);
      u.uTintMix.value += (finish.tintMix - u.uTintMix.value) * Math.min(1, delta * 6);
      u.uFlakes.value += (finish.flakes - u.uFlakes.value) * Math.min(1, delta * 6);
      (u.uTint.value as Color).lerp(finish.tint, Math.min(1, delta * 6));
    }
  });

  return (
    <group ref={root} position={POSITION} scale={0} visible={false}>
      <group ref={card}>
        <mesh geometry={body} castShadow>
          <meshStandardMaterial color="#F1F5F9" roughness={0.35} metalness={0.05} />
        </mesh>
        <mesh position-z={DEPTH / 2 + 0.0008} material={frontMaterial}>
          <planeGeometry args={[WIDTH, HEIGHT]} />
        </mesh>
        <mesh position-z={-DEPTH / 2 - 0.0008} rotation-y={Math.PI} material={backMaterial}>
          <planeGeometry args={[WIDTH, HEIGHT]} />
        </mesh>
      </group>
    </group>
  );
}
