import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import "./status.css";

// The frame for the account status pages: top bar with the logo, and the card centered below it.
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="top">
        <Link className="brand" href="/"><Image src="/shoof-blob.svg" alt="" width={34} height={34} /><span>Shoof</span></Link>
      </header>
      <main>{children}</main>
    </>
  );
}
