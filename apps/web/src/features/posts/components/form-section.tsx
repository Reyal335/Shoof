import type { ReactNode } from "react";

/** One numbered card of the create-post form. */
export function FormSection({ number, title, optional, children }: { number: number; title: string; optional?: boolean; children: ReactNode }) {
  return (
    <fieldset className="sec">
      <legend>
        <span className="sec-title">
          <span className="num" aria-hidden="true">{number}</span>
          {title}
          {optional && <> <span className="opt">(optional)</span></>}
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

/** The "! message" line under a field. Always rendered so aria-describedby can point at it; hidden while empty. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <span className="err" id={id} hidden={!message}>
      {message}
    </span>
  );
}
