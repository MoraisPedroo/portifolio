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
    { label: "Itens no armazém", value: stats.total },
    { label: "Modelos diferentes", value: stats.models },
    { label: "Entradas recentes", value: stats.recent, tone: "text-dp" },
    { label: "Acabando", value: stats.critical, tone: "text-signal" },
  ];

  return (
    <div className="overflow-hidden rounded-3xl bg-ink text-white">
      <div className="relative">
        <View className="h-[340px] w-full touch-pan-y sm:h-[460px]">
          <WarehouseScene />
        </View>
        <ul className="pointer-events-none absolute inset-x-5 top-5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-fog">
          {LEGEND.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span className={`size-2.5 rounded-sm ${item.color}`} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-rule-dark p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por corredor">
          <span className="mr-2 text-sm font-medium text-fog">Corredor</span>
          <button
            type="button"
            aria-pressed={focus === null}
            onClick={() => useDemo.setState({ aisle: null })}
            className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
              focus === null ? "border-nto bg-nto text-ink" : "border-rule-dark text-white hover:border-fog"
            }`}
          >
            Todos
          </button>
          {AISLE_NAMES.map((name, i) => (
            <button
              key={name}
              type="button"
              aria-pressed={focus === i}
              onClick={() => useDemo.getState().toggleAisle(i)}
              className={`min-h-10 min-w-10 rounded-full border px-3 text-sm font-semibold transition-colors ${
                focus === i ? "border-nto bg-nto text-ink" : "border-rule-dark text-white hover:border-fog"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label}>
              <dt className="text-sm text-fog">{card.label}</dt>
              <dd className={`display-tight tabular mt-1 text-4xl ${card.tone ?? "text-white"}`}>{card.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
