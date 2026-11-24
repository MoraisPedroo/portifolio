"use client";

import { useEffect, useRef } from "react";
import { products } from "@/content/site";
import { BadgeEditor, BadgeStage } from "../credencial/BadgeStudio";
import { ArchitectureFlow } from "../dpprinter/ArchitectureFlow";
import { DpPrinterClips } from "../dpprinter/DpPrinterClips";
import { PrintSimulator } from "../dpprinter/PrintSimulator";
import { ApiHub } from "../estoquento/ApiHub";
import { WarehouseRoom } from "../estoquento/WarehouseRoom";

type ProductId = (typeof products)[number]["id"];

function Content({ id }: { id: ProductId }) {
  if (id === "dpprinter") {
    return (
      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr] [&>*]:min-w-0">
        <div className="space-y-5">
          <DpPrinterClips />
          <ArchitectureFlow />
        </div>
        <PrintSimulator />
      </div>
    );
  }
  if (id === "estoquento") {
    return (
      <div className="grid gap-5 lg:h-[min(640px,72svh)] lg:grid-cols-[1.35fr_1fr] [&>*]:min-w-0">
        <div className="flex min-h-0 flex-col">
          <WarehouseRoom />
          <p className="mt-2 text-sm text-fog">
            Sala de estoque em 3D do EstoqueNTO, com dados de demonstração. Arraste para girar e clique numa prateleira.
          </p>
        </div>
        <div className="text-ink lg:min-h-0">
          <ApiHub />
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-5 lg:h-[min(600px,72svh)] lg:grid-cols-[1fr_1fr] [&>*]:min-w-0">
      <BadgeEditor />
      <BadgeStage />
    </div>
  );
}

/** Demonstração interativa de cada produto, aberta por cima da revista. */
export function DemoDialog({ id, onClose }: { id: ProductId | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const product = products.find((p) => p.id === id);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (id && !dialog.open) dialog.showModal();
    if (!id && dialog.open) dialog.close();
  }, [id]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="demo-title"
      className="m-auto max-h-[94svh] w-[min(1240px,96vw)] overflow-hidden rounded-3xl border border-white/12 bg-ink p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {product && (
        <div className="flex max-h-[94svh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3.5 sm:px-6">
            <div className="min-w-0">
              <p className="text-sm text-fog">Demonstração interativa</p>
              <h2 id="demo-title" className="editorial truncate text-2xl">
                {product.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar demonstração"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-fog transition-colors hover:border-white/50 hover:text-white"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <path d="m4 4 8 8m0-8-8 8" />
              </svg>
            </button>
          </div>
          <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
            <Content id={product.id} />
          </div>
        </div>
      )}
    </dialog>
  );
}
