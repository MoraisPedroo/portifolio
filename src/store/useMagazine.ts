import { create } from "zustand";

/** Folhas da revista: capa, 3 spreads de produto e contracapa. */
export const MAG_SHEETS = 4;
/** 0 = capa fechada, 1..3 = produtos abertos, 4 = contracapa. */
export const MAG_LAST = MAG_SHEETS;

export const SPREADS = [
  { page: 0, label: "Capa" },
  { page: 1, label: "DP Printer", accent: "bg-dp" },
  { page: 2, label: "EstoqueNTO", accent: "bg-nto" },
  { page: 3, label: "Credencial Studio", accent: "bg-cred" },
];

type MagazineState = {
  page: number;
  setPage: (page: number) => void;
  next: () => void;
  prev: () => void;
};

export const useMagazine = create<MagazineState>((set, get) => ({
  page: 0,
  setPage: (page) => set({ page: Math.max(0, Math.min(MAG_LAST, page)) }),
  // Depois da contracapa, volta para a capa.
  next: () => set({ page: get().page >= MAG_LAST ? 0 : get().page + 1 }),
  prev: () => set({ page: get().page <= 0 ? MAG_LAST : get().page - 1 }),
}));
