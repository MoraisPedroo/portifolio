/** Sala 3D do EstoqueNTO (versão de demonstração em public/sala3d), carregada sob demanda. */
export function WarehouseRoom() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-rule bg-[#eaf0f5]">
      <iframe
        src="/sala3d/index.html"
        title="Sala de estoque do EstoqueNTO em 3D (demonstração)"
        loading="lazy"
        className="h-[420px] w-full border-0 sm:h-[460px] lg:h-auto lg:min-h-0 lg:flex-1"
      />
    </div>
  );
}
