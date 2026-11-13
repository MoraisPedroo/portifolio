import { AISLES } from "@/store/useDemo";

export const BAYS = 6;
export const LEVELS = 3;
export const AISLE_NAMES = ["A", "B", "C", "D"];

export type SlotStatus = "normal" | "recent" | "critical";
export type Slot = { aisle: number; bay: number; level: number; status: SlotStatus; model: number };

/** Gerador determinístico: o armazém é igual em toda visita. */
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const slots: Slot[] = (() => {
  const random = mulberry(2026);
  const list: Slot[] = [];
  for (let aisle = 0; aisle < AISLES; aisle++) {
    for (let bay = 0; bay < BAYS; bay++) {
      for (let level = 0; level < LEVELS; level++) {
        const roll = random();
        const model = Math.floor(random() * 4);
        if (roll < 0.16) continue; // posição vazia
        const status: SlotStatus = roll > 0.86 ? "critical" : roll > 0.66 ? "recent" : "normal";
        list.push({ aisle, bay, level, status, model });
      }
    }
  }
  return list;
})();

export type AisleStats = { total: number; models: number; recent: number; critical: number };

export function aisleStats(aisle: number | null): AisleStats {
  const scope = aisle === null ? slots : slots.filter((s) => s.aisle === aisle);
  return {
    total: scope.length,
    models: new Set(scope.map((s) => s.model)).size,
    recent: scope.filter((s) => s.status === "recent").length,
    critical: scope.filter((s) => s.status === "critical").length,
  };
}
