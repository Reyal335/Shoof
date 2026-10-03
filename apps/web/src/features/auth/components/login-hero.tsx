import Image from "next/image";
import type { ReactNode } from "react";
import { GameCells } from "@/components/site-previews";

const GAME_CELLS = "020102010201021001200030003000300020011003000300030003000300120020003000";
const CHART_BARS = [32, 50, 38, 64, 53, 74, 59, 46, 69];

/** The navy brand panel beside the login form. Hidden at 960px and below. */
export function LoginHero() {
  return (
    <div className="relative hidden flex-col gap-9 overflow-hidden bg-navy pt-11 pl-14 text-on-navy split:flex">
      <div className="flex items-center gap-3">
        <Image src="/shoof-blob.svg" alt="" width={40} height={40} />
        <span className="font-display text-[30px] font-semibold text-yellow">Shoof</span>
      </div>

      <div className="flex max-w-[560px] flex-col gap-4 pr-14">
        {/* Not a heading: this panel is hidden on small screens, so "Log in" is the page's h1. */}
        <p className="m-0 font-display text-[60px]/[60px] font-semibold tracking-[-2px]">
          Don&apos;t describe your site. <span className="text-yellow">Show it.</span>
        </p>
        <p className="m-0 text-[19px]/[29px] text-on-navy-muted">
          Games, portfolios, SaaS and CSS experiments, posted as the real thing. No repo to open
          and no README to read.
        </p>
      </div>

      {/* Staggered collage that runs off the bottom edge of the panel. */}
      <div className="relative min-h-[420px] grow">
        <div className="absolute top-0 left-0 flex w-[300px] flex-col gap-5">
          <BrowserFrame url="[yourgame].example.com">
            <div role="img" aria-label="Preview of a browser game" className="h-[190px]">
              <GameCells cells={GAME_CELLS} className="h-full grid-cols-12 bg-[#1d1b3a] p-3.5" />
            </div>
          </BrowserFrame>
          <BrowserFrame url="[layout-study].example.com">
            <div
              role="img"
              aria-label="Preview of a CSS layout study"
              className="flex h-[190px] flex-col gap-2.5 bg-[#dfe5f2] p-3.5"
            >
              <div className="flex h-[52px] gap-2.5">
                <div className="grow rounded-lg bg-navy" />
                <div className="grow-2 rounded-lg bg-yellow" />
                <div className="grow rounded-lg bg-field-border" />
              </div>
              <div className="flex grow gap-2.5">
                <div className="grow rounded-lg bg-[#9db4f0]" />
                <div className="flex grow-2 flex-col gap-2.5">
                  <div className="grow rounded-lg bg-navy" />
                  <div className="grow rounded-lg bg-white" />
                </div>
              </div>
            </div>
          </BrowserFrame>
        </div>

        <div className="absolute top-14 left-[330px] flex w-[320px] flex-col gap-5">
          <BrowserFrame url="[yourapp].example.com">
            <div role="img" aria-label="Preview of a SaaS dashboard" className="flex h-[210px] bg-ground">
              <div className="flex w-12 flex-col items-center gap-3 bg-navy pt-3.5">
                <div className="size-5 rounded-md bg-yellow" />
                <div className="h-1.5 w-5 rounded-[3px] bg-on-navy-faint" />
                <div className="h-1.5 w-5 rounded-[3px] bg-on-navy-faint" />
              </div>
              <div className="flex grow flex-col gap-2.5 p-3.5">
                <div className="flex gap-2">
                  <div className="h-[38px] grow rounded-lg bg-white" />
                  <div className="h-[38px] grow rounded-lg bg-white" />
                  <div className="h-[38px] grow rounded-lg bg-white" />
                </div>
                <div className="flex grow items-end gap-[7px] rounded-lg bg-white p-2.5">
                  {CHART_BARS.map((height, i) => (
                    <div key={i} className="grow rounded-t-[3px] bg-link" style={{ height }} />
                  ))}
                </div>
              </div>
            </div>
          </BrowserFrame>
          <BrowserFrame url="[yourname].dev">
            <div
              role="img"
              aria-label="Preview of a portfolio"
              className="flex h-[210px] flex-col gap-3 bg-[#fbfbfd] px-5 py-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-2 w-[50px] rounded bg-navy" />
                <div className="flex gap-2.5">
                  <div className="h-1.5 w-7 rounded-[3px] bg-field-border" />
                  <div className="h-1.5 w-7 rounded-[3px] bg-field-border" />
                </div>
              </div>
              <div className="flex grow items-center gap-3.5">
                <div className="flex grow flex-col gap-[9px]">
                  <div className="h-4 w-[90%] rounded-[5px] bg-navy" />
                  <div className="h-4 w-[64%] rounded-[5px] bg-navy" />
                  <div className="mt-1.5 h-5 w-[50px] rounded-[10px] bg-yellow" />
                </div>
                <div className="size-20 shrink-0 rounded-full bg-yellow" />
              </div>
            </div>
          </BrowserFrame>
        </div>

        <Image
          src="/shoof-blob.svg"
          alt="Shoof mascot"
          width={84}
          height={83}
          className="absolute -top-[34px] left-[600px]"
        />
      </div>
    </div>
  );
}

function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-navy-raised">
      <div className="flex h-[30px] items-center gap-1.5 px-3">
        <span className="size-2 rounded-full bg-on-navy-faint" />
        <span className="size-2 rounded-full bg-on-navy-faint" />
        <span className="size-2 rounded-full bg-on-navy-faint" />
        <span className="ml-1.5 text-[11px] text-on-navy-muted">{url}</span>
      </div>
      {children}
    </div>
  );
}
