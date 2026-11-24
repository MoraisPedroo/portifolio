"use client";

import { useState, useSyncExternalStore } from "react";
import { H2, INNER, LEAD, PAGE } from "@/components/Section";
import { company, Subject, SUBJECTS, whatsappLink } from "@/content/site";

const FIELD =
  "mt-1.5 w-full rounded-xl border border-rule bg-white px-3.5 py-[clamp(0.5rem,1.4vh,0.7rem)] text-base text-ink outline-none transition-colors placeholder:text-slate/60 focus:border-ink";
const LABEL = "text-sm font-semibold text-ink";

const noop = () => () => {};

function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          ?.writeText(value)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          })
          .catch(() => {});
      }}
      className="rounded-full border border-rule px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
    >
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

export function ContactView() {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [summary, setSummary] = useState("");

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
    const lines = [
      name && `Nome: ${name}`,
      org && `Empresa/operação: ${org}`,
      `Assunto: ${current.label}`,
      summary && `Resumo: ${summary}`,
    ].filter(Boolean);
    return [current.message, "", ...lines].join("\n");
  };

  const fiscal = [
    { label: "Razão social", value: company.legalName },
    { label: "CNPJ", value: company.cnpj, mono: true },
    { label: "Sede", value: company.location },
  ];

  return (
    <main>
      {/* Conversa */}
      <section aria-labelledby="contato-title" className={`${PAGE} bg-paper pt-16 lg:h-[100svh] lg:min-h-[600px]`}>
        <div className={`${INNER} grid items-center gap-10 lg:grid-cols-[1fr_1fr] [&>*]:min-w-0`}>
          <div>
            <p className="text-[15px] font-medium text-slate">Contato</p>
            <h1 id="contato-title" className="editorial mt-[clamp(0.5rem,1.6vh,1rem)] text-[clamp(2.3rem,min(4.6vw,7.6vh),4.2rem)] text-ink">
              Conte o problema da sua operação.
            </h1>
            <p className={`${LEAD} mt-[clamp(0.75rem,2.2vh,1.25rem)] max-w-[34rem] text-slate`}>
              Quem responde é quem escreve o código. Diga o que trava hoje, quais sistemas estão envolvidos e onde a equipe perde tempo:
              a partir disso a gente devolve um caminho técnico e um prazo.
            </p>

            <div className="mt-[clamp(1rem,3vh,2rem)] space-y-3">
              <a
                href={whatsappLink(current.message)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl bg-ink px-5 py-[clamp(0.8rem,2vh,1.1rem)] text-white transition-colors hover:bg-graphite-2"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-ink">
                  <WhatsAppIcon />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold">Conversar no WhatsApp</span>
                  <span className="block font-mono text-sm text-fog">{company.whatsappDisplay}</span>
                </span>
                <span className="ml-auto hidden text-sm text-fog sm:block">Assunto: {current.label}</span>
              </a>

              {company.email && (
                <div className="flex items-center gap-4 rounded-2xl border border-rule bg-stock px-5 py-[clamp(0.7rem,1.8vh,1rem)]">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-slate">E-mail</span>
                    <a href={`mailto:${company.email}`} className="block truncate font-mono text-[15px] font-semibold text-ink underline-offset-4 hover:underline">
                      {company.email}
                    </a>
                  </span>
                  <CopyButton value={company.email} />
                </div>
              )}
            </div>
          </div>

          <form
            className="rounded-3xl border border-rule bg-stock p-5 sm:p-6 lg:p-[clamp(1.1rem,3vh,1.75rem)]"
            onSubmit={(e) => {
              e.preventDefault();
              window.open(whatsappLink(composed()), "_blank", "noopener,noreferrer");
            }}
          >
            <h2 className="editorial text-[clamp(1.5rem,3.4vh,2rem)] text-ink">Resumo do projeto</h2>
            <p className="mt-1 text-sm text-slate">Quatro campos. O texto vai pronto para o WhatsApp, você só confere e envia.</p>
            <div className="mt-[clamp(0.75rem,2vh,1.25rem)] grid gap-[clamp(0.6rem,1.6vh,1rem)] sm:grid-cols-2">
              <label className="block">
                <span className={LABEL}>Nome</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} className={FIELD} placeholder="Como podemos te chamar" />
              </label>
              <label className="block">
                <span className={LABEL}>Empresa ou operação</span>
                <input value={org} onChange={(e) => setOrg(e.target.value)} autoComplete="organization" maxLength={80} className={FIELD} placeholder="Laboratório, distribuidora..." />
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
                <span className={LABEL}>Resumo</span>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  maxLength={800}
                  rows={4}
                  className={`${FIELD} h-[clamp(5.5rem,16vh,8.5rem)] resize-none`}
                  placeholder="Ex.: imprimimos etiquetas de amostra em 40 unidades e o Browser Print vive travando."
                />
              </label>
            </div>
            <div className="mt-[clamp(0.75rem,2vh,1.25rem)] flex flex-wrap gap-2">
              <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-semibold text-white transition-colors hover:bg-graphite-2">
                <WhatsAppIcon className="size-[18px]" />
                Enviar pelo WhatsApp
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
          </form>
        </div>
      </section>

      {/* Sócios e dados da empresa */}
      <section aria-labelledby="socios-title" className={`${PAGE} bg-ink text-white`}>
        <div className={`${INNER} flex flex-col justify-center`}>
          <h2 id="socios-title" className={`${H2} max-w-3xl`}>
            Dois sócios, os dois escrevendo código.
          </h2>
          <p className={`${LEAD} mt-[clamp(0.6rem,1.8vh,1rem)] max-w-2xl text-fog`}>
            Sem gerente de conta no meio: o projeto é conduzido por quem desenhou o DP Printer, o EstoqueNTO e o Credencial Studio.
          </p>
          <div className="mt-[clamp(1.25rem,4vh,2.5rem)] grid gap-4 md:grid-cols-[1fr_1fr_1.1fr] [&>*]:min-w-0">
            {company.partners.map((partner) => (
              <article key={partner.fullName} className="flex flex-col rounded-3xl border border-rule-dark bg-graphite p-[clamp(1.1rem,3vh,1.75rem)]">
                <span className="grid size-12 place-items-center rounded-full bg-white/8 font-mono text-[15px] font-semibold text-brass">
                  {partner.fullName
                    .split(" ")
                    .filter((part) => /^[A-Z]/.test(part) && !part.endsWith("."))
                    .map((part) => part[0])
                    .join("")}
                </span>
                <h3 className="editorial mt-4 text-[clamp(1.4rem,3vh,1.75rem)]">{partner.fullName}</h3>
                <p className="mt-1 text-[15px] text-fog">{partner.role}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-[#C9D0DA]">{partner.focus}</p>
                {partner.linkedin && (
                  <div className="mt-auto pt-4">
                  <a
                    href={partner.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center rounded-full border border-white/20 px-4 text-sm font-semibold transition-colors hover:border-white/50"
                  >
                    LinkedIn
                  </a>
                  </div>
                )}
              </article>
            ))}
            <dl className="rounded-3xl border border-rule-dark">
              {fiscal.map((row, i) => (
                <div key={row.label} className={`px-6 py-[clamp(0.7rem,2vh,1.1rem)] ${i > 0 ? "border-t border-rule-dark" : ""}`}>
                  <dt className="text-sm text-fog">{row.label}</dt>
                  <dd className={`mt-0.5 font-semibold ${row.mono ? "font-mono text-[15px]" : ""}`}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </main>
  );
}
