import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { company, products } from "@/content/site";
import { editorialFont, monoFont, sansFont } from "@/lib/fonts";
import { ClientCanvas } from "@/three/ClientCanvas";
import "./globals.css";

const description =
  "Engenharia de software sob medida em São Paulo. DP Printer (impressão térmica do navegador, 7.000+ laboratórios), EstoqueNTO e Credencial Studio em produção.";

const SITE = "https://www.dpsystemsbrasil.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  
  title: { default: "DP Systems — Engenharia de software sob medida", template: "%s · DP Systems" },
  description,
  openGraph: {
    title: "DP Systems — Engenharia de software sob medida",
    description,
    locale: "pt_BR",
    type: "website",
    siteName: "DP Systems",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: company.name,
      legalName: company.legalName,
      taxID: company.cnpj,
      url: `${SITE}/`,
      logo: `${SITE}/images/logo-mark.png`,
      description: company.tagline,
      sameAs: [company.linkedin],
      founder: company.partners.map((p) => ({ "@type": "Person", name: p.fullName, ...(p.linkedin ? { sameAs: p.linkedin } : {}) })),
      address: {
        "@type": "PostalAddress",
        addressLocality: "São Paulo",
        addressRegion: "SP",
        addressCountry: "BR",
      },
      contactPoint: { "@type": "ContactPoint", contactType: "sales", telephone: `+${company.whatsappNumber}`, availableLanguage: "pt-BR" },
    },
    ...products.map((product) => ({
      "@type": "SoftwareApplication",
      name: product.name,
      description: product.summary,
      applicationCategory: "BusinessApplication",
      operatingSystem: product.id === "estoquento" ? "Web" : "Windows",
      ...(product.url ? { url: product.url } : {}),
      publisher: { "@id": `${SITE}/#org` },
    })),
  ],
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
