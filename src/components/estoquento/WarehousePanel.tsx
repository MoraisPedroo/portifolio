"use client";

import { View } from "@react-three/drei";
import { AISLE_NAMES, aisleStats } from "@/content/warehouse";
import { useDemo } from "@/store/useDemo";
import { WarehouseScene } from "@/three/WarehouseScene";

const LEGEND = [
  { label: "Em estoque", color: "bg-[#E6EAF0]" },
  { label: "Entrada recente", color: "bg-dp" },
  { label: "Acabando", color: "bg-signal" },
];

export function WarehousePanel() {
  const hover = useDemo((s) => s.hoverAisle);
  const aisle = useDemo((s) => s.aisle);
  const focus = hover ?? aisle;
  const stats = aisleStats(focus);
  const cards = [
    { label: "Itens", value: stats.total },
    { label: "Modelos", value: stats.models },
    { label: "Recentes", value: stats.recent, tone: "text-dp" },
    { label: "Acabando", value: stats.critical, tone: "text-signal" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-ink text-white">
      <div className="relative flex min-h-0 flex-1 flex-col">
        <View className="h-[300px] w-full touch-pan-y sm:h-[380px] lg:h-auto lg:min-h-[160px] lg:flex-1" >
          <WarehouseScene />
        </View>
        <ul className="pointer-events-none absolute inset-x-4 top-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-fog">
          {LEGEND.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span className={`size-2.5 rounded-sm ${item.color}`} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-rule-dark px-4 py-[clamp(0.6rem,1.6vh,1rem)]">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por corredor">
          <span className="mr-1 text-sm font-medium text-fog">Corredor</span>
          {[null, 0, 1, 2, 3].map((value) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={focus === value}
              onClick={() => (value === null ? useDemo.setState({ aisle: null }) : useDemo.getState().toggleAisle(value))}
              className={`min-h-9 min-w-9 rounded-full border px-3 text-sm font-semibold transition-colors ${
                focus === value ? "border-nto bg-nto text-ink" : "border-rule-dark text-white hover:border-fog"
              }`}
            >
              {value === null ? "Todos" : AISLE_NAMES[value]}
            </button>
          ))}
        </div>
        <dl className="flex gap-5">
          {cards.map((card) => (
            <div key={card.label}>
              <dt className="text-xs text-fog">{card.label}</dt>
              <dd className={`display-tight tabular text-2xl ${card.tone ?? "text-white"}`}>{card.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
