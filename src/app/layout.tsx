import type { Metadata, Viewport } from "next";
import { company } from "@/content/site";
import { displayFont, monoFont } from "@/lib/fonts";
import "./globals.css";

const description = `${company.positioning} ${company.mission} ${company.missionSub}`;

export const metadata: Metadata = {
  title: `${company.name} — ${company.tagline}`,
  description,
  openGraph: {
    title: `${company.name} — ${company.tagline}`,
    description,
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#090A0F",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${displayFont.variable} ${monoFont.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
