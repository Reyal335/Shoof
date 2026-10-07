import Link from "next/link";
import { AuthShell } from "./auth-shell";
import { StatusCard } from "./status-card";

// Shown once the API has accepted the token. Without an address (the bare /verified route) it stays generic.
export function VerifiedPage({ email }: { email?: string }) {
  return (
    <AuthShell>
      <StatusCard
        tone="ok"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>}
      >
        <h1 id="title" tabIndex={-1}>You are verified</h1>
        <p className="lead">Thanks for confirming {email ? <strong>{email}</strong> : "your email"}. Your Shoof account is ready.</p>
        <Link className="btn" href="/">Continue to Shoof</Link>
        <Link className="alt" href="/profile">Set up your profile first</Link>
      </StatusCard>
    </AuthShell>
  );
}
