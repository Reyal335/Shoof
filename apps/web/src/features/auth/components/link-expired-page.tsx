"use client";

import Link from "next/link";
import { useResendVerification } from "../hooks/use-resend-verification";
import { AuthShell } from "./auth-shell";
import { StatusCard } from "./status-card";

// Sending a new link needs a session (the API mails the signed-in user), so a signed-out visitor is sent to log in.
export function LinkExpiredPage() {
  const { resend, status, error } = useResendVerification();
  const sent = status === "sent";
  const verified = status === "verified";
  const signedOut = status === "signed-out";

  return (
    <AuthShell>
      <StatusCard
        tone="wait"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>}
      >
        <div id="live" role="status" aria-live="polite" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
          <h1 id="title" tabIndex={-1}>{sent ? "New link sent" : verified ? "Already verified" : "This link has expired"}</h1>
          <p className="lead" id="body">
            {sent && "Check your inbox for a fresh verification link. It may take a minute to arrive."}
            {verified && "Your email is already confirmed, so there's nothing left to do here."}
            {signedOut && "Log in first, then we can send a new link to your account's email."}
            {!sent && !verified && !signedOut && "Verification links only work for a limited time, or once. Send yourself a new one to finish setting up your account."}
            {error && <><br />{error}</>}
          </p>
        </div>
        {signedOut
          ? <Link className="btn" href="/login?next=/link-expired">Log in</Link>
          : <button className="btn" type="button" id="resend" disabled={status === "pending"} onClick={() => void resend()}>{sent ? "Send it again" : "Send a new link"}</button>}
        <Link className="alt" href="/login">Back to log in</Link>
      </StatusCard>
    </AuthShell>
  );
}
