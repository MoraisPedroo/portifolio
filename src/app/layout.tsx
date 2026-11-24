import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { company } from "@/content/site";
import { editorialFont, monoFont, sansFont } from "@/lib/fonts";
import { ClientCanvas } from "@/three/ClientCanvas";
import "./globals.css";

const description = `${company.manifesto} ${company.manifestoSub} Middleware de impressão, gestão de parque de impressoras e crachás CR80, em produção.`;

export const metadata: Metadata = {
  title: { default: "DP Systems — Engenharia de software sob medida", template: "%s · DP Systems" },
  description,
  openGraph: {
    title: "DP Systems — Engenharia de software sob medida",
    description,
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.name,
  legalName: company.legalName,
  taxID: company.cnpj,
  address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressRegion: "SP", addressCountry: "BR" },
  url: "https://www.dpsystemsbrasil.com.br/",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sansFont.variable} ${monoFont.variable} ${editorialFont.variable}`}>
      <body>
        <Header />
        {children}
        {/* Um canvas WebGL para o site inteiro: continua montado ao trocar de aba. */}
        <ClientCanvas />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
