"use client";

import { useEffect, useRef } from "react";
import { BACKGROUNDS, BackgroundKey } from "./backgrounds";

const KEYS = Object.keys(BACKGROUNDS) as BackgroundKey[];

function Layer({ id, active }: { id: BackgroundKey; active: boolean }) {
  const bg = BACKGROUNDS[id];
  const video = useRef<HTMLVideoElement>(null);
  const still = useRef<HTMLImageElement>(null);

  // Só o vídeo do estado ativo roda; os outros ficam parados.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active]);

  // Sem vídeo, a foto ganha um movimento lento de câmera enquanto o estado está ativo.
  useEffect(() => {
    const el = still.current;
    if (!el || bg.video || !active) return;
    const drift = el.animate(
      [
        { transform: "scale(1.08) translate3d(-1.2%, 0.6%, 0)" },
        { transform: "scale(1.2) translate3d(1.2%, -0.8%, 0)" },
      ],
      { duration: 22000, direction: "alternate", iterations: Infinity, easing: "ease-in-out" },
    );
    return () => drift.cancel();
  }, [active, bg.video]);

  return (
    <div
      aria-hidden
      className="absolute inset-0 transition-opacity duration-[900ms] ease-out"
      style={{ opacity: active ? 1 : 0 }}
    >
      {bg.poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={still}
          src={bg.poster}
          alt=""
          className={`absolute inset-0 size-full scale-110 object-cover ${bg.video ? "opacity-45 blur-[6px]" : "opacity-60 blur-[2px]"}`}
        />
      )}
      {bg.video && (
        <video
          ref={video}
          className="absolute inset-0 size-full object-cover"
          src={bg.video}
          poster={bg.poster ?? undefined}
          muted
          loop
          playsInline
          preload={active ? "auto" : "metadata"}
        />
      )}
      {/* Cor do produto vinda das bordas, deixando o centro escuro para a revista. */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 70% at 50% 50%, rgba(11,13,16,0.86) 0%, rgba(11,13,16,0.55) 55%, rgba(${bg.tint},0.22) 100%)`,
        }}
      />
      <p
        className={`editorial pointer-events-none absolute -bottom-[0.18em] left-1/2 -translate-x-1/2 whitespace-nowrap text-[min(22vw,30vh)] italic text-white/[0.045] transition-transform duration-[1400ms] ease-out ${
          active ? "translate-y-0" : "translate-y-10"
        }`}
      >
        {bg.word}
      </p>
    </div>
  );
}

/** Camada atrás da revista: troca imagem, vídeo, cor e tipografia junto com a página. */
export function DynamicBackground({ active }: { active: BackgroundKey }) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-ink">
      {KEYS.map((key) => (
        <Layer key={key} id={key} active={key === active} />
      ))}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, transparent 30%, black 85%)",
        }}
      />
    </div>
  );
}
