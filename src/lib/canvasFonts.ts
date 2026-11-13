import { displayFont, monoFont } from "@/lib/fonts";
import type { Fonts } from "@/lib/surface";

export const fonts: Fonts = {
  display: displayFont.style.fontFamily,
  mono: monoFont.style.fontFamily,
};

/** Garante que as fontes da página estejam prontas antes de desenhar no canvas. */
export function loadFonts() {
  const requests = [400, 500, 600, 700, 800].flatMap((weight) => [
    document.fonts.load(`${weight} 16px ${fonts.display}`),
    document.fonts.load(`${weight} 16px ${fonts.mono}`),
  ]);
  return Promise.all(requests).catch(() => undefined);
}

/** Estado de entrada por toque, lido pela câmera a cada quadro (fora do React). */
export const touchInput = { active: false, panX: 0, panY: 0 };
