"use client";

import { View } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { MagazineScene } from "@/three/magazine/MagazineScene";

/** Capa da revista na Apresentação: clicar leva para a aba Projetos. */
export function HomeCover() {
  const router = useRouter();
  const open = () => router.push("/projetos");
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <View className="h-[400px] w-full cursor-pointer touch-pan-y sm:h-[480px] lg:h-auto lg:min-h-0 lg:flex-1">
        <MagazineScene fixedPage={0} onFlip={open} />
      </View>
      <p className="mt-1 text-center text-sm text-slate">Clique na capa para folhear</p>
    </div>
  );
}
