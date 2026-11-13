"use client";

import { View } from "@react-three/drei";
import { credencial } from "@/content/site";
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
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option, i) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === i}
            onClick={() => onChange(i)}
            className={`min-h-10 rounded-full border px-4 text-[15px] font-medium transition-colors ${
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

export function BadgeStudio() {
  const demo = useDemo();

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] [&>*]:min-w-0">
      <form className="order-2 rounded-3xl border border-rule-dark bg-graphite p-5 sm:p-7 lg:order-1" onSubmit={(e) => e.preventDefault()}>
        <h3 className="text-xl font-bold text-white">Monte um crachá</h3>
        <p className="mt-1.5 text-[15px] text-fog">O cartão ao lado muda enquanto você edita.</p>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-fog">Nome no crachá</span>
            <input
              value={demo.name}
              onChange={(e) => demo.setField("name", e.target.value)}
              maxLength={22}
              autoComplete="off"
              className="mt-2 w-full rounded-xl border border-rule-dark bg-ink px-4 py-3 text-base text-white outline-none transition-colors placeholder:text-fog/50 focus:border-cred"
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
              className="mt-2 w-full rounded-xl border border-rule-dark bg-ink px-4 py-3 text-base text-white outline-none transition-colors placeholder:text-fog/50 focus:border-cred"
              placeholder="Seu cargo"
            />
          </label>
          <Choice legend="Nível de acesso" options={credencial.access} value={demo.access} onChange={demo.setAccess} />
          <Choice legend="Acabamento" options={credencial.finishes} value={demo.finish} onChange={demo.setFinish} />
        </div>
      </form>

      <div className="order-1 flex flex-col overflow-hidden rounded-3xl bg-[radial-gradient(120%_90%_at_50%_30%,#2a2350_0%,#0e1116_70%)] lg:order-2">
        <View className="h-[440px] w-full touch-pan-y sm:h-[560px]">
          <BadgeScene />
        </View>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
          <span className="text-sm text-fog">Passe o mouse para inclinar e ver o acabamento reagir à luz.</span>
          <button
            type="button"
            onClick={demo.flip}
            className="rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-ink transition-colors hover:bg-cred"
          >
            {demo.flipped ? "Ver a frente" : "Virar o crachá"}
          </button>
        </div>
      </div>
    </div>
  );
}
