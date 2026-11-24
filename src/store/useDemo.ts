import { create } from "zustand";
import { credencialDemo, dpprinterDemo, estoquentoHub } from "@/content/site";

export const PRINT_MS = 1500;

export type PrintEvent = {
  id: string;
  lab: string;
  operator: string;
  station: string;
  time: string;
  json: string;
};

type Ping = { start: number; done: boolean };

type DemoState = {
  // DP Printer
  lab: number;
  operator: number;
  station: number;
  printStart: number | null;
  printCount: number;
  events: PrintEvent[];
  copiedAt: number | null;
  pick: (key: "lab" | "operator" | "station", value: number) => void;
  print: () => void;
  copyJson: () => void;
  // EstoqueNTO
  pings: Record<number, Ping>;
  selected: number;
  ping: (index: number) => void;
  pingAll: () => void;
  // Credencial Studio
  name: string;
  role: string;
  fn: number;
  finish: number;
  flipped: boolean;
  setField: (key: "name" | "role", value: string) => void;
  setFn: (fn: number) => void;
  setFinish: (finish: number) => void;
  flip: () => void;
};

const now = () => performance.now();

/**
 * Mesmo formato do evento que o DP Printer grava em inventario/{lc}/{serial}
 * depois de cada impressão. Os valores são de demonstração.
 */
function buildEvent(state: DemoState, count: number): PrintEvent {
  const lab = dpprinterDemo.labs[state.lab];
  const operator = dpprinterDemo.operators[state.operator];
  const station = dpprinterDemo.stations[state.station];
  const date = new Date();
  const serial = "DEMO" + String(48210 + state.lab * 7).padStart(8, "0");
  const payload = {
    caminho: `inventario/${lab.replace("LC ", "")}/${serial}`,
    lc: lab.replace("LC ", ""),
    serial,
    impressora: "ZDesigner ZD230 (USB Raw)",
    computador: station,
    usuario: operator,
    cidade: "São Paulo",
    uf: "SP",
    versao_app: "4.0",
    contador: 1200 + count,
    data_hora: date.toISOString().slice(0, 19).replace("T", " "),
  };
  return {
    id: `${lab} · ${serial}`,
    lab,
    operator,
    station,
    time: date.toLocaleTimeString("pt-BR"),
    json: JSON.stringify(payload, null, 2),
  };
}

export const useDemo = create<DemoState>((set, get) => ({
  lab: 0,
  operator: 0,
  station: 0,
  printStart: null,
  printCount: 0,
  events: [],
  copiedAt: null,
  pick: (key, value) => set({ [key]: value } as Pick<DemoState, typeof key>),
  print: () => {
    if (get().printStart !== null) return;
    set({ printStart: now() });
    setTimeout(() => {
      const state = get();
      const count = state.printCount + 1;
      set({
        printStart: null,
        printCount: count,
        events: [buildEvent(state, count), ...state.events].slice(0, 4),
      });
    }, PRINT_MS);
  },
  copyJson: () => {
    const last = get().events[0];
    if (!last) return;
    navigator.clipboard?.writeText(last.json).catch(() => {});
    set({ copiedAt: now() });
    setTimeout(() => set({ copiedAt: null }), 1600);
  },

  pings: {},
  selected: 8,
  ping: (index) => {
    const current = get().pings[index];
    if (current && !current.done) return;
    set({ selected: index, pings: { ...get().pings, [index]: { start: now(), done: false } } });
    setTimeout(() => {
      set({ pings: { ...get().pings, [index]: { start: get().pings[index].start, done: true } } });
    }, estoquentoHub.integrations[index].ms);
  },
  pingAll: () => {
    estoquentoHub.integrations.forEach((_, index) => {
      setTimeout(() => {
        const selected = get().selected;
        get().ping(index);
        set({ selected });
      }, index * 90);
    });
  },

  name: credencialDemo.sample.name,
  role: credencialDemo.sample.role,
  fn: 0,
  finish: 0,
  flipped: false,
  setField: (key, value) => set({ [key]: value.slice(0, key === "name" ? 22 : 28) } as Pick<DemoState, typeof key>),
  setFn: (fn) => set({ fn }),
  setFinish: (finish) => set({ finish }),
  flip: () => set({ flipped: !get().flipped }),
}));
