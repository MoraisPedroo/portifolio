import { editorialFont, monoFont, sansFont } from "@/lib/fonts";
import type { Fonts } from "@/lib/surface";

export const fonts: Fonts = {
  display: sansFont.style.fontFamily,
  mono: monoFont.style.fontFamily,
  editorial: editorialFont.style.fontFamily,
};

/** Garante que as fontes estejam prontas antes de desenhar no canvas. */
export function loadFonts() {
  const requests = [400, 500, 600, 700, 800].flatMap((weight) => [
    document.fonts.load(`${weight} 16px ${fonts.display}`),
    document.fonts.load(`${weight} 16px ${fonts.mono}`),
    document.fonts.load(`${weight} 16px ${fonts.editorial}`),
  ]);
  return Promise.all(requests).catch(() => undefined);
}
