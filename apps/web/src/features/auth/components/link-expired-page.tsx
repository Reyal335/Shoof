"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "./auth-shell";
import { StatusCard } from "./status-card";

// Mock, like design/LinkExpired.html: nothing is sent anywhere. The address is a placeholder.
export function LinkExpiredPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthShell>
      <StatusCard
        tone="wait"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>}
      >
        <div id="live" role="status" aria-live="polite" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
          <h1 id="title" tabIndex={-1}>{sent ? "New link sent" : "This link has expired"}</h1>
          <p className="lead" id="body">
            {sent
              ? "Check you@example.com for a fresh verification link. It may take a minute to arrive."
              : "Verification links only work for a limited time, or once. Send yourself a new one to finish setting up your account."}
          </p>
        </div>
        <button className="btn" type="button" id="resend" onClick={() => setSent(true)}>{sent ? "Send it again" : "Send a new link"}</button>
        <Link className="alt" href="/login">Back to log in</Link>
      </StatusCard>
    </AuthShell>
  );
}
