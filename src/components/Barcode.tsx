const PATTERN = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2, 1, 2, 1, 1, 3, 1, 2];

/** Código de barras decorativo, desenhado com barras de larguras fixas. */
export function Barcode({ className = "", bars = 32 }: { className?: string; bars?: number }) {
  let x = 0;
  const rects = [];
  for (let i = 0; i < bars; i++) {
    const w = PATTERN[i % PATTERN.length];
    rects.push(<rect key={i} x={x} y={0} width={w} height={40} />);
    x += w + PATTERN[(i * 7 + 3) % PATTERN.length];
  }
  return (
    <svg viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" className={className} aria-hidden fill="currentColor">
      {rects}
    </svg>
  );
}
