import { create } from "zustand";
import { LAST_PAGE } from "@/content/site";

type Half = "left" | "right";

type BookState = {
  /** 0 = capa fechada, 1..4 = spreads abertos, 5 = contracapa fechada */
  page: number;
  /** Em telas estreitas a câmera mostra uma página por vez. */
  half: Half;
  single: boolean;
  /** Aproxima a câmera; o ponteiro (ou o arrasto) desloca a vista. */
  zoom: boolean;
  reading: boolean;
  webgl: boolean;
  fps: number;
  setPage: (page: number) => void;
  next: () => void;
  prev: () => void;
  setSingle: (single: boolean) => void;
  toggleZoom: () => void;
  setReading: (reading: boolean) => void;
  setWebgl: (webgl: boolean) => void;
  setFps: (fps: number) => void;
};

const isOpen = (page: number) => page > 0 && page < LAST_PAGE;

export const useBook = create<BookState>((set, get) => ({
  page: 0,
  half: "left",
  single: false,
  zoom: false,
  reading: false,
  webgl: true,
  fps: 60,
  setPage: (page) =>
    set({ page: Math.max(0, Math.min(LAST_PAGE, page)), half: "left" }),
  next: () => {
    const { page, half, single } = get();
    if (single && isOpen(page) && half === "left") return set({ half: "right" });
    if (page < LAST_PAGE) set({ page: page + 1, half: "left" });
  },
  prev: () => {
    const { page, half, single } = get();
    if (single && isOpen(page) && half === "right") return set({ half: "left" });
    if (page > 0) set({ page: page - 1, half: "right" });
  },
  setSingle: (single) => set({ single }),
  toggleZoom: () => set({ zoom: !get().zoom }),
  setReading: (reading) => set({ reading }),
  setWebgl: (webgl) => set({ webgl }),
  setFps: (fps) => set({ fps }),
}));
