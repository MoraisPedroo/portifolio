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
        <DpPrinterSection />
        <EstoqueSection />
        <CredencialSection />
        <AboutSection />
      </main>
      <ContactSection />
      <ClientCanvas />
    </>
  );
}
