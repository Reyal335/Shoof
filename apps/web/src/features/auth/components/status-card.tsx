import Image from "next/image";
import type { ReactNode } from "react";

// The white card: the mascot medal with a badge, then whatever the page puts below it (heading, text, actions).
// `tone` picks the badge colour (yellow for success, grey for waiting); `icon` is the badge glyph.
export function StatusCard({ tone, icon, children }: { tone: "ok" | "wait"; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="card" aria-labelledby="title">
      <div className="medal">
        <Image src="/shoof-blob.svg" alt="Shoof mascot" width={84} height={83} />
        <div className={`badge ${tone}`}>{icon}</div>
      </div>
      {children}
    </section>
  );
}
