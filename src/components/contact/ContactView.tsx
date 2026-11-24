"use client";

import { useState, useSyncExternalStore } from "react";
import { INNER } from "@/components/Section";
import { company, Subject, SUBJECTS, whatsappLink } from "@/content/site";

const FIELD =
  "mt-1.5 w-full rounded-xl border border-rule bg-white px-3.5 py-[clamp(0.45rem,1.3vh,0.65rem)] text-base text-ink outline-none transition-colors placeholder:text-slate/60 focus:border-ink";
const LABEL = "text-sm font-semibold text-ink";
const ROW = "flex items-center gap-4 border-b border-rule py-[clamp(0.55rem,1.6vh,0.85rem)]";
const ROW_LABEL = "w-24 shrink-0 text-sm text-slate";

const noop = () => () => {};

/** Fase do projeto em um clique: entra na mensagem sem a pessoa digitar. */
const PHASES = ["Tenho um gargalo mapeado", "Quero migrar um sistema antigo", "Quero ver uma demonstração"];

function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

function LinkedInIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4v-11Z" />
    </svg>
  );
}

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter((part) => /^[A-Z]/.test(part) && !part.endsWith("."))
    .map((part) => part[0])
    .join("");
}

export function ContactView() {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [summary, setSummary] = useState("");
  const [phase, setPhase] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ?assunto=credencial vem dos botões da revista; o que a pessoa escolher vale mais.
  const fromUrl = useSyncExternalStore(
    noop,
    () => new URLSearchParams(window.location.search).get("assunto"),
    () => null,
  );
  const [picked, setSubject] = useState<Subject | null>(null);
  const subject = picked ?? SUBJECTS.find((s) => s.id === fromUrl)?.id ?? "sob-medida";
  const current = SUBJECTS.find((s) => s.id === subject) ?? SUBJECTS[0];

  const composed = () => {
    const hello = name ? `Olá, sou ${name}${org ? ` da ${org}` : ""}.` : current.message;
    const lines = [`Assunto: ${current.label}`, phase && `Fase: ${phase}`, summary && `Cenário: ${summary}`].filter(Boolean);
    return [hello, "", ...lines].join("\n");
  };

  const copy = () => {
    navigator.clipboard
      ?.writeText(composed())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      })
      .catch(() => {});
  };

  return (
    <main>
      <section aria-labelledby="contato-title" className="bg-paper pt-16 lg:h-[100svh] lg:min-h-[600px]">
        <div className={`${INNER} grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14 [&>*]:min-w-0`}>
          {/* Empresa e pessoas */}
          <div>
            <p className="text-[15px] font-medium text-slate">Contato</p>
            <h1 id="contato-title" className="editorial mt-[clamp(0.4rem,1.4vh,0.9rem)] text-[clamp(2.2rem,min(4vw,6.6vh),3.6rem)] leading-[1.06] text-ink">
              Conte o problema da sua operação.
            </h1>
            <p className="mt-[clamp(0.6rem,1.8vh,1.1rem)] max-w-[32rem] text-[clamp(1rem,2.1vh,1.1rem)] leading-relaxed text-slate">
              Quem responde é quem escreve o código. Descreva o gargalo e devolvemos um diagnóstico técnico e uma estimativa de prazo.
            </p>

            <dl className="mt-[clamp(1rem,3vh,1.9rem)] border-t border-rule">
              <div className={ROW}>
                <dt className={ROW_LABEL}>WhatsApp</dt>
                <dd className="min-w-0 flex-1">
                  <a
                    href={whatsappLink(current.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 font-semibold text-ink"
                  >
                    <WhatsAppIcon className="size-[18px] text-[#1FAF56]" />
                    <span className="font-mono text-[15px]">{company.whatsappDisplay}</span>
                    <span className="text-slate transition-transform group-hover:translate-x-0.5" aria-hidden>
                      ↗
                    </span>
                  </a>
                </dd>
              </div>
              {company.email && (
                <div className={ROW}>
                  <dt className={ROW_LABEL}>E-mail</dt>
                  <dd className="min-w-0 flex-1 truncate">
                    <a href={`mailto:${company.email}`} className="font-mono text-[15px] font-semibold text-ink hover:underline">
                      {company.email}
                    </a>
                  </dd>
                </div>
              )}
              <div className={ROW}>
                <dt className={ROW_LABEL}>Empresa</dt>
                <dd className="min-w-0 flex-1">
                  <a href={company.linkedin} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 font-semibold text-ink">
                    <LinkedInIcon className="size-4 text-[#0A66C2]" />
                    DP Systems no LinkedIn
                    <span className="text-slate transition-transform group-hover:translate-x-0.5" aria-hidden>
                      ↗
                    </span>
                  </a>
                </dd>
              </div>
              <div className={ROW}>
                <dt className={ROW_LABEL}>CNPJ</dt>
                <dd className="min-w-0 flex-1">
                  <span className="font-mono text-[15px] font-semibold text-ink">{company.cnpj}</span>
                  <span className="mt-0.5 block truncate text-[13px] text-slate">{company.legalName}</span>
                </dd>
              </div>
            </dl>

            <ul className="mt-[clamp(0.9rem,2.6vh,1.5rem)] grid gap-3 sm:grid-cols-2" aria-label="Sócios">
              {company.partners.map((partner) => (
                <li key={partner.fullName}>
                  <a
                    href={partner.linkedin ?? company.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-2xl border border-rule bg-stock px-3.5 py-[clamp(0.55rem,1.6vh,0.8rem)] transition-colors hover:border-ink"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink font-mono text-sm font-semibold text-brass">
                      {initials(partner.fullName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{partner.fullName}</span>
                      <span className="block truncate text-[13px] text-slate">Sócio · engenharia</span>
                    </span>
                    <LinkedInIcon className="size-4 shrink-0 text-slate transition-colors group-hover:text-[#0A66C2]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Formulário que monta a mensagem */}
          <form
            className="rounded-3xl border border-rule bg-stock p-5 sm:p-6 lg:p-[clamp(1.1rem,3vh,1.75rem)] short:py-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              window.open(whatsappLink(composed()), "_blank", "noopener,noreferrer");
            }}
          >
            <h2 className="editorial text-[clamp(1.5rem,3.4vh,2rem)] text-ink">Resumo do projeto</h2>
            <p className="mt-1 text-sm text-slate short:hidden">Montamos o texto pronto para o WhatsApp. Você revisa antes de enviar.</p>
            <div className="mt-[clamp(0.7rem,1.9vh,1.15rem)] grid gap-[clamp(0.55rem,1.5vh,0.95rem)] sm:grid-cols-2">
              <label className="block">
                <span className={LABEL}>Nome</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} className={FIELD} placeholder="Seu nome" />
              </label>
              <label className="block">
                <span className={LABEL}>Empresa ou operação</span>
                <input
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  autoComplete="organization"
                  maxLength={80}
                  className={FIELD}
                  placeholder="Ex.: laboratório, distribuidora"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={LABEL}>Assunto</span>
                <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)} className={FIELD}>
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className={LABEL}>O que trava hoje?</span>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  maxLength={800}
                  rows={3}
                  className={`${FIELD} h-[clamp(4.5rem,12vh,7rem)] resize-none short:h-12`}
                  placeholder="Ex.: imprimimos etiquetas em 40 unidades e o Zebra Browser Print trava toda semana."
                />
              </label>
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-semibold text-ink">Em que ponto você está? (opcional)</legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {PHASES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={phase === item}
                      onClick={() => setPhase(phase === item ? null : item)}
                      className={`min-h-9 rounded-full border px-3 text-sm font-medium transition-colors short:min-h-8 ${
                        phase === item ? "border-ink bg-ink text-white" : "border-rule bg-white text-ink hover:border-ink"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="mt-[clamp(0.75rem,2vh,1.2rem)] flex flex-wrap items-center gap-2">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-semibold text-white transition-colors hover:bg-graphite-2"
              >
                <WhatsAppIcon className="size-[18px]" />
                Abrir resumo no WhatsApp
              </button>
              <button
                type="button"
                onClick={copy}
                className="inline-flex min-h-11 items-center rounded-full border border-rule px-5 text-[15px] font-semibold text-ink transition-colors hover:border-ink"
              >
                Copiar resumo
              </button>
              {company.email && (
                <a
                  href={`mailto:${company.email}?subject=${encodeURIComponent(current.label)}&body=${encodeURIComponent(composed())}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-rule px-5 text-[15px] font-semibold text-ink transition-colors hover:border-ink"
                >
                  Enviar por e-mail
                </a>
              )}
            </div>
            <p className="mt-1.5 min-h-5 text-sm text-dp-deep" role="status">
              {copied ? "Resumo copiado. Cole no WhatsApp ou no e-mail quando preferir." : ""}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
