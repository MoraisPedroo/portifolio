import type { Metadata } from "next";
import { ContactView } from "@/components/contact/ContactView";

export const metadata: Metadata = {
  title: "Contato",
  alternates: { canonical: "/contato" },
  description: "Fale com a engenharia da DP Systems pelo WhatsApp e conte o problema da sua operação.",
};

export default function ContactPage() {
  return <ContactView />;
}
