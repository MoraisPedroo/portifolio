import { create } from "zustand";
import { credencial, dpprinter, estoquento } from "@/content/site";

export const PRINT_MS = 1500;
export const AISLES = 4;

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
  hoverAisle: number | null;
  aisle: number | null;
  pulse: { aisle: number; at: number } | null;
  ping: (index: number) => void;
  pingAll: () => void;
  select: (index: number) => void;
  setHoverAisle: (aisle: number | null) => void;
  toggleAisle: (aisle: number) => void;
  // Credencial Studio
  name: string;
  role: string;
  access: number;
  finish: number;
  flipped: boolean;
  focus: "name" | "role" | null;
  setField: (key: "name" | "role", value: string) => void;
  setFocus: (focus: "name" | "role" | null) => void;
  setAccess: (access: number) => void;
  setFinish: (finish: number) => void;
  flip: () => void;
};

const now = () => performance.now();

function buildEvent(state: DemoState, count: number): PrintEvent {
  const lab = dpprinter.sim.labs[state.lab];
  const operator = dpprinter.sim.operators[state.operator];
  const station = dpprinter.sim.stations[state.station];
  const date = new Date();
  const payload = {
    event: "PRINT_DISPATCH_RAW_USB",
    status: "SPOOLER_BYPASSED_OK",
    lab_id: lab,
    operator,
    station_pc: station,
    serial_device: "DEMO-USB-" + String(4800 + count).padStart(6, "0"),
    registro: "AUD-" + date.getFullYear() + "-" + String(88400 + count),
    timestamp: date.toISOString(),
    firebase_sync_ms: 17,
  };
  return {
    id: payload.registro,
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
  hoverAisle: null,
  aisle: null,
  pulse: null,
  ping: (index) => {
    const current = get().pings[index];
    if (current && !current.done) return;
    set({
      selected: index,
      pings: { ...get().pings, [index]: { start: now(), done: false } },
    });
    setTimeout(() => {
      set({
        pings: { ...get().pings, [index]: { start: get().pings[index].start, done: true } },
        pulse: { aisle: index % AISLES, at: now() },
      });
    }, estoquento.integrations[index].ms);
  },
  pingAll: () => {
    estoquento.integrations.forEach((_, index) => {
      setTimeout(() => {
        const selected = get().selected;
        get().ping(index);
        set({ selected });
      }, index * 90);
    });
  },
  select: (index) => set({ selected: index }),
  setHoverAisle: (hoverAisle) => {
    if (get().hoverAisle !== hoverAisle) set({ hoverAisle });
  },
  toggleAisle: (aisle) => set({ aisle: get().aisle === aisle ? null : aisle }),

  name: credencial.sample.name,
  role: credencial.sample.role,
  access: 0,
  finish: 0,
  flipped: false,
  focus: null,
  setField: (key, value) =>
    set({ [key]: value.slice(0, key === "name" ? 22 : 28) } as Pick<DemoState, typeof key>),
  setFocus: (focus) => set({ focus }),
  setAccess: (access) => set({ access }),
  setFinish: (finish) => set({ finish }),
  flip: () => set({ flipped: !get().flipped }),
}));
