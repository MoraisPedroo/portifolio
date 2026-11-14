import { credencial } from "@/content/site";
import { Brand, H2, INNER, LEAD, PAGE } from "../Section";
import { BadgeEditor, BadgeStage } from "./BadgeStudio";

export function CredencialSection() {
  return (
    <section id="credencial" aria-labelledby="credencial-title" className={`${PAGE} bg-ink text-white`}>
      <div
        className={`${INNER} grid gap-8 lg:grid-cols-[1fr_1fr] lg:grid-rows-[minmax(0,1fr)] lg:gap-12 [&>*]:min-w-0`}
      >
        <div className="flex flex-col justify-center">
          <Brand color="bg-cred">{credencial.name}</Brand>
          <h2 id="credencial-title" className={`${H2} mt-[clamp(0.6rem,2vh,1.25rem)]`}>
            {credencial.title}
          </h2>
          <p className={`${LEAD} mt-[clamp(0.5rem,1.6vh,1rem)] max-w-xl text-fog`}>{credencial.copy}</p>
          <div className="mt-[clamp(1rem,3vh,1.75rem)]">
            <BadgeEditor />
          </div>
        </div>
        <BadgeStage />
      </div>
    </section>
  );
}
