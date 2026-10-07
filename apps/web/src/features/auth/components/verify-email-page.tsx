"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { verifyEmail } from "../api";
import { AuthShell } from "./auth-shell";
import { LinkExpiredPage } from "./link-expired-page";
import { StatusCard } from "./status-card";
import { VerifiedPage } from "./verified-page";

type Result = { state: "checking" } | { state: "verified"; email: string } | { state: "invalid" } | { state: "failed" };

// The page the emailed link opens. The token is single use, so it is posted once: the ref keeps
// React's dev-mode effect re-run from burning it on the first request and failing the second.
export function VerifyEmailPage({ token }: { token?: string }) {
  const [result, setResult] = useState<Result>(token ? { state: "checking" } : { state: "invalid" });
  const posted = useRef(false);

  useEffect(() => {
    if (!token || posted.current) return;
    posted.current = true;
    verifyEmail(token).then(
      ({ email }) => setResult({ state: "verified", email }),
      (err: unknown) => setResult({ state: err instanceof ApiError && err.status === 400 ? "invalid" : "failed" }),
    );
  }, [token]);

  if (result.state === "verified") return <VerifiedPage email={result.email} />;
  if (result.state === "invalid") return <LinkExpiredPage />;

  return (
    <AuthShell>
      <StatusCard
        tone="wait"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#101b33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>}
      >
        <div role="status" aria-live="polite" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
          <h1 id="title" tabIndex={-1}>{result.state === "checking" ? "Verifying your email" : "We couldn't verify it"}</h1>
          <p className="lead">
            {result.state === "checking"
              ? "Hang on a moment while we confirm your address."
              : "Something went wrong on our side. Check your connection, then reload this page."}
          </p>
        </div>
      </StatusCard>
    </AuthShell>
  );
}
