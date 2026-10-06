"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import "./register.css";

type Values = { name: string; email: string; password: string; terms: boolean };
type Field = keyof Values;
type Errors = Partial<Record<Field, string>>;

// In page order, so the first invalid one gets focus.
const FIELDS: Field[] = ["name", "email", "password", "terms"];

// Same rules and messages as design/Register.html. This is a mock: nothing is sent or stored.
function validate({ name, email, password, terms }: Values): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = "Enter a display name.";
  if (!email.trim()) errors.email = "Enter your email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter a valid email, like you@example.com.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (!terms) errors.terms = "Agree to the Terms and Privacy Policy to continue.";
  return errors;
}

function Check() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dba40c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
  );
}

export function RegisterPage() {
  const [values, setValues] = useState<Values>({ name: "", email: "", password: "", terms: false });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"form" | "sent">("form");
  const [resent, setResent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const sentTitleRef = useRef<HTMLHeadingElement>(null);

  const focusField = (field: Field) => (formRef.current?.elements.namedItem(field) as HTMLInputElement | null)?.focus();

  function update<K extends Field>(field: K, value: Values[K]) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Once a field is flagged, re-check as the user fixes it, so its error clears as soon as it is valid.
    if (errors[field]) setErrors(validate(next));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    const firstInvalid = FIELDS.find((field) => found[field]);
    // Render the errors (or the sent view) before moving focus, so it lands on an element that is up to date.
    flushSync(() => {
      setErrors(found);
      if (!firstInvalid) {
        setStatus("sent");
        setResent(false);
      }
    });
    if (firstInvalid) focusField(firstInvalid);
    else sentTitleRef.current?.focus();
  }

  function backToForm() {
    flushSync(() => setStatus("form"));
    focusField("email");
  }

  return (
    <div className="split">
      <section className="hero" aria-label="About Shoof">
        <Link className="brand" href="/"><Image src="/shoof-blob.svg" alt="" width={40} height={40} /><span>Shoof</span></Link>
        <div className="pitch">
          <h1>Post the site. <span>Skip the README.</span></h1>
          <p>Create a free account to share the games, portfolios, apps and experiments you built, and find people to build the next one with.</p>
        </div>
        <div className="collage">
          <div className="frame a">
            <div className="bar"><i></i><i></i><i></i><span>[yourgame].example.com</span></div>
            <div className="shot game" role="img" aria-label="Preview of a browser game">
              <span className="c2"></span><span className="c0"></span><span className="c0"></span><span className="c1"></span><span className="c2"></span><span className="c0"></span><span className="c0"></span><span className="c2"></span><span className="c1"></span><span className="c0"></span>
              <span className="c0"></span><span className="c3"></span><span className="c0"></span><span className="c0"></span><span className="c0"></span><span className="c3"></span><span className="c0"></span><span className="c0"></span><span className="c0"></span><span className="c3"></span>
              <span className="c0"></span><span className="c0"></span><span className="c0"></span><span className="c3"></span><span className="c0"></span><span className="c0"></span><span className="c1"></span><span className="c2"></span><span className="c0"></span><span className="c0"></span>
              <span className="c2"></span><span className="c1"></span><span className="c0"></span><span className="c0"></span><span className="c3"></span><span className="c0"></span><span className="c0"></span><span className="c0"></span><span className="c3"></span><span className="c0"></span>
              <span className="c0"></span><span className="c0"></span><span className="c3"></span><span className="c0"></span><span className="c0"></span><span className="c0"></span><span className="c3"></span><span className="c0"></span><span className="c0"></span><span className="c0"></span>
            </div>
          </div>
          <div className="frame b">
            <div className="bar"><i></i><i></i><i></i><span>[yourapp].example.com</span></div>
            <div className="shot saas" role="img" aria-label="Preview of a SaaS dashboard">
              <div className="side"><i className="sq"></i><i></i><i></i></div>
              <div className="main">
                <div className="tiles"><i></i><i></i></div>
                <div className="chart"><i style={{ height: "24px" }}></i><i style={{ height: "37px" }}></i><i style={{ height: "29px" }}></i><i style={{ height: "48px" }}></i><i style={{ height: "40px" }}></i><i style={{ height: "55px" }}></i><i style={{ height: "44px" }}></i><i style={{ height: "35px" }}></i></div>
              </div>
            </div>
          </div>
          <Image className="mascot" src="/shoof-blob.svg" alt="Shoof mascot" width={76} height={75} />
        </div>
        <ul className="points">
          <li><Check />Post any site with a link and screenshots</li>
          <li><Check />List your tech stack and collaborators on your profile</li>
          <li><Check />Get feedback and find people to build with</li>
        </ul>
      </section>

      <main className="formside">
        <Link className="brand mbrand" href="/"><Image src="/shoof-blob.svg" alt="" width={40} height={40} /><span>Shoof</span></Link>

        <form ref={formRef} id="form" noValidate onSubmit={submit} hidden={status !== "form"}>
          <div className="group">
            <h2>Create your account</h2>
            <p className="lead">It takes less than a minute.</p>
          </div>
          <div className="group">
            <label className="t" htmlFor="name">Display name</label>
            <input className="field" id="name" name="name" type="text" placeholder="How you appear on Shoof" autoComplete="nickname" aria-describedby="name-err" aria-invalid={errors.name ? true : undefined} value={values.name} onChange={(e) => update("name", e.target.value)} />
            <span className="err" id="name-err" hidden={!errors.name}>{errors.name}</span>
          </div>
          <div className="group">
            <label className="t" htmlFor="email">Email</label>
            <input className="field" id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" aria-describedby="email-err" aria-invalid={errors.email ? true : undefined} value={values.email} onChange={(e) => update("email", e.target.value)} />
            <span className="err" id="email-err" hidden={!errors.email}>{errors.email}</span>
          </div>
          <div className="group">
            <label className="t" htmlFor="password">Password</label>
            <div className="pw">
              <input className="field" id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Create a password" autoComplete="new-password" aria-describedby="pwhelp password-err" aria-invalid={errors.password ? true : undefined} value={values.password} onChange={(e) => update("password", e.target.value)} />
              <button className="eye" id="eye" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
            </div>
            <span className="help" id="pwhelp">Use at least 8 characters.</span>
            <span className="err" id="password-err" hidden={!errors.password}>{errors.password}</span>
          </div>
          <div className="group">
            <label className="terms"><input id="terms" type="checkbox" aria-describedby="terms-err" checked={values.terms} onChange={(e) => update("terms", e.target.checked)} /><span>I agree to the <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</span></label>
            <span className="err" id="terms-err" hidden={!errors.terms}>{errors.terms}</span>
          </div>
          <button className="btn" type="submit">Create account</button>
          <div className="or"><i></i><span>or</span><i></i></div>
          <button className="ghost" type="button">Sign up with GitHub</button>
          <p className="switch">Already have an account? <Link href="/login">Log in</Link></p>
        </form>

        <div className="sent" id="sent" role="status" hidden={status !== "sent"}>
          <div className="badge"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#dba40c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 7l8.5 6 8.5-6" /></svg></div>
          <h2 ref={sentTitleRef} tabIndex={-1} id="sent-title">Check your inbox</h2>
          <p className="big">We sent a verification link to <strong id="sent-email">{values.email.trim()}</strong>. Open it to finish creating your account.</p>
          <p className="small">Nothing there? Check your spam folder, or send the link again.</p>
          <div className="row">
            <button className="ghost" type="button" id="resend" onClick={() => setResent(true)}>Resend email</button>
            <button className="ghost quiet" type="button" id="back" onClick={backToForm}>Use a different email</button>
          </div>
          <p className="note" id="resent" role="status" hidden={!resent}>Sent again. It can take a minute to arrive.</p>
        </div>
      </main>
    </div>
  );
}
