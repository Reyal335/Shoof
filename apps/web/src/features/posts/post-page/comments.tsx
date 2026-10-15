"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

type Added = { id: number; text: string; date: string };

/** Today as YYYY-MM-DD in the viewer's time zone, for the <time dateTime> of a comment just posted. */
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Composer and comment list. Comments you post are kept on this page only and show above the existing ones. */
export function Comments() {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [added, setAdded] = useState<Added[]>([]);
  const nextId = useRef(1);
  const field = useRef<HTMLTextAreaElement>(null);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = text.trim();
    if (!value) {
      setError("Write something before posting.");
      field.current?.focus();
      return;
    }
    setError("");
    setAdded([{ id: nextId.current++, text: value, date: today() }, ...added]);
    setText("");
  }

  return (
    <section className="card sec" aria-labelledby="h-comments">
      <h2 id="h-comments">Comments <span className="n">(<span>{3 + added.length}</span>)</span></h2>
      <form className="composer" noValidate onSubmit={submit}>
        <label htmlFor="comment">Add a comment</label>
        <textarea
          id="comment"
          ref={field}
          maxLength={500}
          placeholder="What did you like? What would you change?"
          aria-describedby="comment-hint comment-err"
          aria-invalid={error ? true : undefined}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError("");
          }}
        />
        <span className="err" id="comment-err" hidden={!error}>{error}</span>
        <div className="crow">
          <span className="hint" id="comment-hint">Be kind and specific. Up to 500 characters.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span className="count" aria-hidden="true">{text.length} / 500</span><button type="submit" className="send">Post comment</button></span>
        </div>
      </form>
      <ol className="clist" aria-label="Comments">
        {added.map((c) => (
          <li key={c.id}><span className="av" aria-hidden="true" style={{ background: '#3b4f86' }} /><div className="cbody"><div className="chead"><Link href="/profile">You</Link><time dateTime={c.date}>Just now</time></div><p>{c.text}</p></div></li>
        ))}
        <li><span className="av" aria-hidden="true" style={{ background: '#6b7ba8' }} /><div className="cbody"><div className="chead"><Link href="/profile">[Commenter]</Link><time dateTime="2026-10-07">2 days ago</time></div><p>Level 3 took me a few tries, but it felt fair. The bounce sound is great.</p></div></li>
        <li><span className="av" aria-hidden="true" style={{ background: '#101b33' }} /><div className="cbody"><div className="chead"><Link href="/profile">[Creator name]</Link><span className="badge">Creator</span><time dateTime="2026-10-07">2 days ago</time></div><p>Thanks! Level 3 gets a gentler start in the next update.</p></div></li>
        <li><span className="av" aria-hidden="true" style={{ background: '#6b7ba8' }} /><div className="cbody"><div className="chead"><Link href="/profile">[Commenter]</Link><time dateTime="2026-10-04">5 days ago</time></div><p>Works well on my phone. Would love a way to restart a level without going back to the menu.</p></div></li>
      </ol>
    </section>
  );
}
