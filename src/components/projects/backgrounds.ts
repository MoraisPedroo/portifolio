/** Fundo de cada estado da revista: imagem sempre presente e vídeo em loop quando existir. */
export type BackgroundKey = "institutional" | "dpprinter" | "estoquento" | "credencial";

export const BACKGROUNDS: Record<
  BackgroundKey,
  { poster: string | null; video: string | null; tint: string; word: string }
> = {
  institutional: { poster: "/videos/bg-institutional.webp", video: "/videos/bg-institutional.mp4", tint: "232,195,138", word: "Engenharia" },
  dpprinter: { poster: "/videos/bg-dpprinter.webp", video: "/videos/bg-dpprinter.mp4", tint: "34,211,238", word: "DP Printer" },
  estoquento: { poster: "/images/estoque-warehouse.webp", video: null, tint: "242,106,27", word: "EstoqueNTO" },
  credencial: { poster: "/images/credencial-printer.webp", video: null, tint: "59,130,246", word: "Credencial" },
};
