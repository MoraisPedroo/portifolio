export function Logo({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-dp text-[12px] font-extrabold text-ink" style={{ fontStretch: "112%" }}>
        DP
      </span>
      <span className={`text-[17px] font-bold tracking-tight ${tone === "light" ? "text-white" : "text-ink"}`} style={{ fontStretch: "112%" }}>
        DP Systems
      </span>
    </span>
  );
}
