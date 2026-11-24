import { create } from "zustand";

/** Folhas da revista: capa, 3 spreads de produto e contracapa. */
export const MAG_SHEETS = 4;
/** 0 = capa fechada, 1..3 = produtos abertos, 4 = contracapa. */
export const MAG_LAST = MAG_SHEETS;

const clamp = (page: number) => Math.max(0, Math.min(MAG_LAST, Math.round(page)));

function readMuted() {
  try {
    return localStorage.getItem("dp-muted") === "1";
  } catch {
    return false;
  }
}

type MagazineState = {
  page: number;
  muted: boolean;
  /** Muda a cada interação da pessoa, para reiniciar a virada automática. */
  touchedAt: number;
  /** Virada automática ligada; para na primeira interação ou no botão de pausa. */
  playing: boolean;
  togglePlaying: () => void;
  setPage: (page: number) => void;
  next: () => void;
  prev: () => void;
  /** Virada automática: não conta como interação. */
  autoNext: () => void;
  toggleMuted: () => void;
  hydrate: () => void;
};

export const useMagazine = create<MagazineState>((set, get) => ({
  page: 0,
  muted: false,
  touchedAt: 0,
  playing: true,
  togglePlaying: () => set({ playing: !get().playing, touchedAt: Date.now() }),
  // Quem vira a página por conta própria está lendo: a virada automática para.
  setPage: (page) => set({ page: clamp(page), touchedAt: Date.now(), playing: false }),
  next: () => set({ page: get().page >= MAG_LAST ? 0 : get().page + 1, touchedAt: Date.now(), playing: false }),
  prev: () => set({ page: get().page <= 0 ? 0 : get().page - 1, touchedAt: Date.now(), playing: false }),
  autoNext: () => set({ page: get().page >= MAG_LAST ? 0 : get().page + 1 }),
  toggleMuted: () => {
    const muted = !get().muted;
    try {
      localStorage.setItem("dp-muted", muted ? "1" : "0");
    } catch {}
    set({ muted });
  },
  hydrate: () => set({ muted: readMuted() }),
}));
