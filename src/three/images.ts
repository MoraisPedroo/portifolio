/** Imagens usadas nas texturas desenhadas em canvas (revista e crachá). */
const cache = new Map<string, HTMLImageElement>();
const listeners = new Set<() => void>();

export const IMAGES = {
  logo: "/images/logo-mark.png",
  dpprinter: "/images/dp-printer.webp",
  warehouse: "/images/estoque-warehouse.webp",
  credencial: "/images/credencial-printer.webp",
};

/** Devolve a imagem se já carregou; senão começa a carregar e devolve null. */
export function getImage(src: string) {
  let image = cache.get(src);
  if (!image) {
    image = new Image();
    image.decoding = "async";
    image.onload = () => listeners.forEach((listener) => listener());
    image.src = src;
    cache.set(src, image);
  }
  return image.complete && image.naturalWidth > 0 ? image : null;
}

export function onImageLoad(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function preloadImages() {
  Object.values(IMAGES).forEach(getImage);
}

/** Desenha a imagem cobrindo o retângulo, como object-fit: cover. */
export function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (image.naturalWidth - sw) / 2;
  const sy = (image.naturalHeight - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}
