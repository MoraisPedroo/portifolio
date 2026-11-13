import { Archivo, JetBrains_Mono } from "next/font/google";

/** Archivo tem eixo de largura: títulos expandidos lembram etiqueta e sinalização industrial. */
export const sansFont = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/** Só para dados reais: JSON, latências, códigos e CNPJ. */
export const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});
