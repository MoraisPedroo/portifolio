import Image from "next/image";

export function Logo({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <span className="flex items-center gap-2.5">
      <Image src="/images/logo-mark.png" alt="" width={34} height={34} priority className="size-[34px]" />
      <span className={`text-[18px] font-bold tracking-tight ${tone === "light" ? "text-white" : "text-ink"}`} style={{ fontStretch: "112%" }}>
        DP Systems
      </span>
    </span>
  );
}
