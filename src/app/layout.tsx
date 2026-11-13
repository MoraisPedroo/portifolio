import type { Metadata, Viewport } from "next";
import { SmoothScroll } from "@/components/SmoothScroll";
import { company } from "@/content/site";
import { monoFont, sansFont } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: `${company.name}: ${company.headline}`,
  description: company.intro,
  openGraph: {
    title: `${company.name}: ${company.headline}`,
    description: company.intro,
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1116",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sansFont.variable} ${monoFont.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
