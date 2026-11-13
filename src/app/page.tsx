import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { CredencialSection } from "@/components/credencial/CredencialSection";
import { DpPrinterSection } from "@/components/dpprinter/DpPrinterSection";
import { EstoqueSection } from "@/components/estoquento/EstoqueSection";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ClientCanvas } from "@/three/ClientCanvas";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <DpPrinterSection
          photo={{
            src: "/images/dp-printer.webp",
            alt: "Impressora térmica preta imprimindo uma etiqueta branca com código de barras (imagem ilustrativa)",
          }}
        />
        <EstoqueSection />
        <CredencialSection
          photo={{
            src: "/images/credencial-printer.webp",
            alt: "Impressora de cartões PVC emitindo um cartão com acabamento holográfico (imagem ilustrativa)",
          }}
        />
        <AboutSection />
      </main>
      <ContactSection />
      <ClientCanvas />
    </>
  );
}
