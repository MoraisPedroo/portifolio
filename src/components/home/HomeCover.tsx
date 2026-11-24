"use client";

import { View } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { MagazineScene } from "@/three/magazine/MagazineScene";

/** Capa da revista na Apresentação: clicar leva para a aba Projetos. */
export function HomeCover() {
  const router = useRouter();
  const open = () => router.push("/projetos");
  return (
    <div className="relative h-full min-h-0">
      <View className="h-[400px] w-full touch-pan-y sm:h-[480px] lg:h-full">
        <MagazineScene fixedPage={0} onFlip={open} />
      </View>
      <button
        type="button"
        onClick={open}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-rule bg-stock/90 px-4 py-2 text-sm font-semibold text-ink backdrop-blur transition-colors hover:border-ink"
      >
        Folhear a revista
      </button>
    </div>
  );
}
