"use client";

import Image from "next/image";
import { cloneElement, createContext, useContext, useState } from "react";
import { FollowButton } from "@/components/follow-button";
import { Header } from "@/components/header";
import { SectionNav, type Section } from "@/components/section-nav";
import { dataOf, type Card } from "@/lib/cards";
import { plural } from "@/lib/plural";
import "./saas.css";

const SECTION_LABELS: Record<Section, string> = {
  all: "all-sites",
  games: "games",
  portfolios: "portfolios",
  saas: "saas",
  "css-ui": "css-ui",
  misc: "misc",
};

// Each row's rank, renumbered 1..n over the rows that pass the filters.
const RankContext = createContext(0);

function Rank() {
  return <span className="rk">{useContext(RankContext)}</span>;
}

function VoteButton({ votes }: { votes: number }) {
  const [voted, setVoted] = useState(false);
  const total = votes + (voted ? 1 : 0);
  return (
    <button
      type="button"
      className="vote"
      aria-pressed={voted}
      aria-label={`Upvote, ${total} votes`}
      data-votes={votes}
      onClick={() => setVoted(!voted)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5l8 11H4z" /></svg>
      <span className="n">{total}</span>
    </button>
  );
}

export function SaasPage() {
  const [category, setCategory] = useState("All categories");
  const [price, setPrice] = useState("Any");
  // The time range only moves the pressed state for now; nothing is ranked by it yet.
  const [range, setRange] = useState("This week");
  const visible = rows.filter(
    (row) =>
      (category === "All categories" || dataOf(row, "cat") === category) && (price === "Any" || dataOf(row, "price") === price),
  );
  const count = visible.length;

  return (
    <>
      <Header />
      <main className="wrap">
        <SectionNav current="saas" labels={SECTION_LABELS} />
        <section className="hero">
          <div>
            <h1>SaaS &amp; products</h1>
            <p>Tools people built and launched. Try them, upvote the ones you would pay for, and tell the maker what you think.</p>
          </div>
          <div className="frow">
            <FollowButton className="follow" on="Following" off="Follow SaaS" hint={{ on: "Launches show first on your home feed.", off: "Follow to see launches first." }} hintFirst />
          </div>
        </section>
        <section className="launch" aria-label="Launching today">
          <div className="lh"><i /><h2>Launching today</h2><span>3 products</span></div>
          <div className="lgrid">
              <article className="lcard">
                <div className="lshot" role="img" aria-label="Screenshot of [Product name]">
                  <div className="side" style={{ background: '#101b33' }}><i className="sq" /><i /><i /></div>
                  <div className="main"><div className="tiles"><i /><i /></div><div className="chart"><i style={{ height: '28px' }} /><i style={{ height: '43px' }} /><i style={{ height: '34px' }} /><i style={{ height: '56px' }} /><i style={{ height: '46px' }} /><i style={{ height: '64px' }} /><i style={{ height: '52px' }} /><i style={{ height: '41px' }} /></div></div>
                </div>
                <div className="lbody">
                  <div className="lrow"><div><h3>[Product name]</h3><span className="tg">Uptime checks with plain-English alerts.</span></div><span className="price">Free</span></div>
                  <a className="try" href="#try">Try it ↗</a>
                </div>
              </article>
              <article className="lcard">
                <div className="lshot" role="img" aria-label="Screenshot of [Product name]">
                  <div className="side" style={{ background: '#1b3a8a' }}><i className="sq" /><i /><i /></div>
                  <div className="main"><div className="tiles"><i /><i /></div><div className="chart"><i style={{ height: '49px' }} /><i style={{ height: '38px' }} /><i style={{ height: '57px' }} /><i style={{ height: '42px' }} /><i style={{ height: '63px' }} /><i style={{ height: '53px' }} /><i style={{ height: '35px' }} /><i style={{ height: '48px' }} /></div></div>
                </div>
                <div className="lbody">
                  <div className="lrow"><div><h3>[Product name]</h3><span className="tg">Book meetings without the back and forth.</span></div><span className="price">Freemium</span></div>
                  <a className="try" href="#try">Try it ↗</a>
                </div>
              </article>
              <article className="lcard">
                <div className="lshot" role="img" aria-label="Screenshot of [Product name]">
                  <div className="side" style={{ background: '#26335c' }}><i className="sq" /><i /><i /></div>
                  <div className="main"><div className="tiles"><i /><i /></div><div className="chart"><i style={{ height: '21px' }} /><i style={{ height: '32px' }} /><i style={{ height: '42px' }} /><i style={{ height: '36px' }} /><i style={{ height: '52px' }} /><i style={{ height: '62px' }} /><i style={{ height: '45px' }} /><i style={{ height: '56px' }} /></div></div>
                </div>
                <div className="lbody">
                  <div className="lrow"><div><h3>[Product name]</h3><span className="tg">Track subscriptions before they renew.</span></div><span className="price">Paid</span></div>
                  <a className="try" href="#try">Try it ↗</a>
                </div>
              </article>
          </div>
        </section>
        <div className="sbody">
          <section className="list" aria-label="Products">
            <div className="list-top">
              <div className="range" role="group" aria-label="Time range"><button type="button" aria-pressed={range === "This week"} onClick={() => setRange("This week")}>This week</button><button type="button" aria-pressed={range === "This month"} onClick={() => setRange("This month")}>This month</button><button type="button" aria-pressed={range === "All time"} onClick={() => setRange("All time")}>All time</button></div>
              <span id="count" aria-live="polite">{plural(count, "product", "products")}</span>
            </div>
            {rows.map((row) => (
              <RankContext key={row.key} value={visible.indexOf(row) + 1}>
                {cloneElement(row, { hidden: !visible.includes(row) })}
              </RankContext>
            ))}
            <p className="empty" id="empty" hidden={count !== 0}>No products match. Try another category or price.</p>
          </section>
          <aside className="side2">
            <section className="panel"><h2>Category</h2><button type="button" className="cat-btn" aria-pressed={category === "All categories"} data-value="All categories" onClick={() => setCategory("All categories")}>All categories</button><button type="button" className="cat-btn" aria-pressed={category === "Dev tools"} data-value="Dev tools" onClick={() => setCategory("Dev tools")}>Dev tools</button><button type="button" className="cat-btn" aria-pressed={category === "Productivity"} data-value="Productivity" onClick={() => setCategory("Productivity")}>Productivity</button><button type="button" className="cat-btn" aria-pressed={category === "Finance"} data-value="Finance" onClick={() => setCategory("Finance")}>Finance</button><button type="button" className="cat-btn" aria-pressed={category === "Marketing"} data-value="Marketing" onClick={() => setCategory("Marketing")}>Marketing</button><button type="button" className="cat-btn" aria-pressed={category === "Education"} data-value="Education" onClick={() => setCategory("Education")}>Education</button><button type="button" className="cat-btn" aria-pressed={category === "Design"} data-value="Design" onClick={() => setCategory("Design")}>Design</button></section>
            <fieldset className="panel"><legend>Pricing</legend><label className="radio"><input type="radio" name="price" value="Any" checked={price === "Any"} onChange={() => setPrice("Any")} /> Any</label><label className="radio"><input type="radio" name="price" value="Free" checked={price === "Free"} onChange={() => setPrice("Free")} /> Free</label><label className="radio"><input type="radio" name="price" value="Freemium" checked={price === "Freemium"} onChange={() => setPrice("Freemium")} /> Freemium</label><label className="radio"><input type="radio" name="price" value="Paid" checked={price === "Paid"} onChange={() => setPrice("Paid")} /> Paid</label></fieldset>
            <section className="cta">
              <Image src="/shoof-blob.svg" alt="" width={48} height={47} />
              <h2>Launching something?</h2>
              <p>Post it with a live link, pricing and your stack. Launch day gets you a spot at the top of this page.</p>
              <a href="#post">Submit a product</a>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}

// The product rows, written out as in design/Saas.html. Filtering reads data-cat and data-price.
const rows: Card[] = [
  <div key="1" className="prod" data-cat="Dev tools" data-price="Freemium">
    <Rank />
    <div className="logo" style={{ background: '#1b3a8a' }}><i className="circle" /></div>
    <div className="pinfo">
      <div className="ptop"><a href="#product">[Product name]</a><span>Turns API logs into readable timelines.</span></div>
      <div className="pmeta"><span className="cat">Dev tools</span><span className="dotsep">·</span><span className="pill Freemium">Freemium</span><span className="stk"><span>React</span><span>Node.js</span></span></div>
    </div>
    <VoteButton votes={312} />
  </div>,
  <div key="2" className="prod" data-cat="Productivity" data-price="Free">
    <Rank />
    <div className="logo" style={{ background: '#b78500' }}><i className="square" /></div>
    <div className="pinfo">
      <div className="ptop"><a href="#product">[Product name]</a><span>A to-do list that plans your week for you.</span></div>
      <div className="pmeta"><span className="cat">Productivity</span><span className="dotsep">·</span><span className="pill Free">Free</span><span className="stk"><span>Vue</span><span>Supabase</span></span></div>
    </div>
    <VoteButton votes={248} />
  </div>,
  <div key="3" className="prod" data-cat="Finance" data-price="Paid">
    <Rank />
    <div className="logo" style={{ background: '#101b33' }}><i className="diamond" /></div>
    <div className="pinfo">
      <div className="ptop"><a href="#product">[Product name]</a><span>Invoices and reminders for freelancers.</span></div>
      <div className="pmeta"><span className="cat">Finance</span><span className="dotsep">·</span><span className="pill Paid">Paid</span><span className="stk"><span>Next.js</span><span>PostgreSQL</span></span></div>
    </div>
    <VoteButton votes={196} />
  </div>,
  <div key="4" className="prod" data-cat="Marketing" data-price="Freemium">
    <Rank />
    <div className="logo" style={{ background: '#157a70' }}><i className="circle" /></div>
    <div className="pinfo">
      <div className="ptop"><a href="#product">[Product name]</a><span>Schedule posts across every channel at once.</span></div>
      <div className="pmeta"><span className="cat">Marketing</span><span className="dotsep">·</span><span className="pill Freemium">Freemium</span><span className="stk"><span>Svelte</span><span>Node.js</span></span></div>
    </div>
    <VoteButton votes={154} />
  </div>,
  <div key="5" className="prod" data-cat="Education" data-price="Free">
    <Rank />
    <div className="logo" style={{ background: '#c2414b' }}><i className="square" /></div>
    <div className="pinfo">
      <div className="ptop"><a href="#product">[Product name]</a><span>Flashcards that adapt to what you forget.</span></div>
      <div className="pmeta"><span className="cat">Education</span><span className="dotsep">·</span><span className="pill Free">Free</span><span className="stk"><span>React</span><span>Firebase</span></span></div>
    </div>
    <VoteButton votes={131} />
  </div>,
  <div key="6" className="prod" data-cat="Design" data-price="Paid">
    <Rank />
    <div className="logo" style={{ background: '#5b6a92' }}><i className="diamond" /></div>
    <div className="pinfo">
      <div className="ptop"><a href="#product">[Product name]</a><span>Export brand colours to every format.</span></div>
      <div className="pmeta"><span className="cat">Design</span><span className="dotsep">·</span><span className="pill Paid">Paid</span><span className="stk"><span>TypeScript</span><span>Rust</span></span></div>
    </div>
    <VoteButton votes={98} />
  </div>,
  <div key="7" className="prod" data-cat="Dev tools" data-price="Free">
    <Rank />
    <div className="logo" style={{ background: '#3b4f86' }}><i className="circle" /></div>
    <div className="pinfo">
      <div className="ptop"><a href="#product">[Product name]</a><span>Spin up a mock API from a JSON file.</span></div>
      <div className="pmeta"><span className="cat">Dev tools</span><span className="dotsep">·</span><span className="pill Free">Free</span><span className="stk"><span>Python</span><span>FastAPI</span></span></div>
    </div>
    <VoteButton votes={87} />
  </div>
];
