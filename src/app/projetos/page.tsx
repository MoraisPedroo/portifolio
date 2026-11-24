import type { Metadata } from "next";
import { ProjectsStage } from "@/components/projects/ProjectsStage";

export const metadata: Metadata = {
  title: "Projetos",
  description:
    "DP Printer, EstoqueNTO e Credencial Studio: middleware de impressão, controle de parque de impressoras e estúdio de crachás, apresentados numa revista 3D.",
};

export default function ProjectsPage() {
  return <ProjectsStage />;
}
