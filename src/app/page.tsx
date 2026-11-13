import { Experience } from "@/components/Experience";
import { ReadingMode } from "@/components/ui/ReadingMode";
import { ReadingShell } from "@/components/ui/ReadingShell";

export default function Home() {
  return (
    <main>
      <Experience />
      <ReadingShell>
        <ReadingMode />
      </ReadingShell>
    </main>
  );
}
