import Image from "next/image";
import { credencial } from "@/content/site";
import { BadgeStudio } from "./BadgeStudio";

export function CredencialSection({ photo }: { photo?: { src: string; alt: string } }) {
  return (
    <section id="credencial" aria-labelledby="credencial-title" className="bg-ink text-white pt-10 pb-24 md:pt-14 md:pb-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <div className="flex items-center gap-3">
          <span className="size-3 rounded-sm bg-cred" />
          <span className="text-lg font-bold">{credencial.name}</span>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h2 id="credencial-title" className="display-tight text-[clamp(1.9rem,min(4.4vw,7.5vh),3.6rem)]">
            {credencial.title}
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-fog">{credencial.copy}</p>
        </div>

        <div className="mt-10">
          <BadgeStudio />
        </div>

        <div className={`mt-16 grid gap-10 border-t border-rule-dark pt-10 ${photo ? "lg:grid-cols-[1fr_1fr] lg:items-center" : ""}`}>
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {credencial.features.map((feature) => (
              <li key={feature.title}>
                <h3 className="font-bold text-white">{feature.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-fog">{feature.text}</p>
              </li>
            ))}
          </ul>
          {photo && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-graphite">
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
