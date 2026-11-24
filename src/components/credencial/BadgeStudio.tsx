"use client";

import { Canvas } from "@react-three/fiber";
import { credencialDemo } from "@/content/site";
import { useDemo } from "@/store/useDemo";
import { BadgeScene } from "@/three/BadgeScene";

function Choice({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: string[];
  value: number;
  onChange: (index: number) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-fog">{legend}</legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {options.map((option, i) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === i}
            onClick={() => onChange(i)}
            className={`min-h-9 rounded-full border px-3.5 text-[15px] font-medium transition-colors ${
              value === i ? "border-cred bg-cred text-ink" : "border-rule-dark text-white hover:border-fog"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const INPUT =
  "mt-1.5 w-full rounded-xl border border-rule-dark bg-ink px-3.5 py-2.5 text-base text-white outline-none transition-colors placeholder:text-fog/50 focus:border-cred";

export function BadgeEditor() {
  const demo = useDemo();
  return (
    <form
      className="flex flex-col rounded-3xl border border-rule-dark bg-graphite p-5 lg:p-[clamp(1rem,2.6vh,1.5rem)]"
      onSubmit={(e) => e.preventDefault()}
    >
      <h3 className="text-lg font-bold text-white">Monte um crachá como no Credencial Studio</h3>
      <div className="mt-[clamp(0.6rem,1.8vh,1rem)] grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-fog">Nome no crachá</span>
          <input
            value={demo.name}
            onChange={(e) => demo.setField("name", e.target.value)}
            maxLength={22}
            autoComplete="off"
            className={INPUT}
            placeholder="Seu nome"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-fog">Cargo ou setor</span>
          <input
            value={demo.role}
            onChange={(e) => demo.setField("role", e.target.value)}
            maxLength={28}
            autoComplete="off"
            className={INPUT}
            placeholder="Seu cargo"
          />
        </label>
      </div>
      <div className="mt-[clamp(0.6rem,1.8vh,1rem)] space-y-[clamp(0.6rem,1.8vh,1rem)]">
        <Choice legend="Função (cor da faixa)" options={credencialDemo.functions.map((f) => f.label)} value={demo.fn} onChange={demo.setFn} />
        <Choice legend="Acabamento" options={credencialDemo.finishes} value={demo.finish} onChange={demo.setFinish} />
      </div>
      <div className="mt-6 border-t border-rule-dark pt-4 lg:mt-auto">
        <p className="text-sm font-medium text-fog">No aplicativo de verdade</p>
        <ul className="mt-2 space-y-1.5 text-[15px] leading-snug text-[#C9D0DA]">
          <li>Importa a base do Access e acha a foto pelo número do crachá.</li>
          <li>Cola linhas do Excel e imprime o lote inteiro de uma vez.</li>
          <li>Mostra frente e verso antes de mandar para a Zebra ZC300.</li>
          <li>Vários computadores usam a mesma pasta de rede, sem gravar um por cima do outro.</li>
        </ul>
      </div>
    </form>
  );
}

export function BadgeStage() {
  const flipped = useDemo((s) => s.flipped);
  const flip = useDemo((s) => s.flip);
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl bg-[radial-gradient(120%_90%_at_50%_30%,#13285a_0%,#0e1116_70%)]">
      <div className="h-[380px] w-full touch-pan-y sm:h-[460px] lg:h-auto lg:min-h-0 lg:flex-1">
        <Canvas dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
          <BadgeScene />
        </Canvas>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
        <span className="text-sm text-fog">Passe o mouse para inclinar o cartão.</span>
        <button
          type="button"
          onClick={flip}
          className="rounded-full bg-white px-4 py-2 text-[15px] font-semibold text-ink transition-colors hover:bg-cred"
        >
          {flipped ? "Ver a frente" : "Virar o crachá"}
        </button>
      </div>
    </div>
  );
}
