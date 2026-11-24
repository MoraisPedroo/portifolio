/** Classes comuns: no desktop cada seção ocupa exatamente uma tela abaixo do cabeçalho. */
export const PAGE = "snap-page lg:h-[calc(100svh-4rem)] lg:min-h-[536px]";
export const INNER = "mx-auto h-full max-w-[1240px] px-5 py-14 md:px-8 lg:py-[clamp(1rem,4vh,2.75rem)]";
export const H2 = "editorial text-[clamp(2rem,min(4vw,6.6vh),3.4rem)]";
export const LEAD = "text-[clamp(1rem,2.2vh,1.125rem)] leading-relaxed";

export function Brand({ color, children, extra }: { color: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={`size-3 rounded-sm ${color}`} />
      <span className="text-lg font-bold">{children}</span>
      {extra}
    </div>
  );
}
