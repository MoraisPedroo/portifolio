"use client";

import { useState } from "react";

/** Gravações reais do DP Printer (as mesmas do site do produto). */
const CLIPS = [
  { id: "usbraw", label: "Impressão USB Raw" },
  { id: "auditoria", label: "Auditoria de ativos" },
  { id: "descoberta", label: "Descoberta de rede" },
  { id: "instalacao", label: "Instalação limpa" },
  { id: "atualizacao", label: "Atualização automática" },
];

export function DpPrinterClips() {
  const [clip, setClip] = useState(CLIPS[0].id);
  return (
    <figure className="overflow-hidden rounded-3xl border border-rule-dark bg-black">
      <video
        key={clip}
        className="aspect-video w-full bg-black"
        src={`/videos/dpprinter/${clip}.mp4`}
        poster={`/videos/dpprinter/${clip}.webp`}
        controls
        autoPlay
        muted
        playsInline
        preload="metadata"
      />
      <figcaption className="flex flex-wrap gap-1.5 border-t border-rule-dark bg-graphite p-3">
        <span className="mr-1 self-center text-sm text-fog">O app funcionando:</span>
        {CLIPS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={clip === item.id}
            onClick={() => setClip(item.id)}
            className={`min-h-9 rounded-full border px-3 text-sm font-medium transition-colors ${
              clip === item.id ? "border-prt bg-prt text-ink" : "border-rule-dark text-white hover:border-fog"
            }`}
          >
            {item.label}
          </button>
        ))}
      </figcaption>
    </figure>
  );
}
