/** The pill beside the heading. Shows "Saved: …" on a yellow tint after a change, otherwise "All changes saved". */
export function SaveStatus({ message }: { message: string | null }) {
  return (
    <p className={message ? "saved on" : "saved"} id="saved" role="status" aria-live="polite">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
      <span id="saved-text">{message ? `Saved: ${message}` : "All changes saved"}</span>
    </p>
  );
}
