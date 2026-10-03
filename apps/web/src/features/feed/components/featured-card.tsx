import { GameCells } from "@/components/site-previews";
import { ArrowUpRightIcon } from "./icons";

const FEATURED_CELLS =
  "000300020021003000300030003000200111010202020201020101200030003000300030012002100300030003000300";

const STACK = ["TypeScript", "Phaser", "Vite"];

const button =
  "flex h-[50px] items-center rounded-[25px] text-base font-semibold no-underline";

export function FeaturedCard() {
  return (
    <article className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-3xl border border-card-border bg-white desktop:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div
        role="img"
        aria-label="Screenshot of the featured site"
        className="flex min-h-[380px] flex-col gap-3.5 bg-[#1d1b3a] p-7"
      >
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#ef6f6f]" />
          <span className="size-2.5 rounded-full bg-yellow" />
          <span className="size-2.5 rounded-full bg-[#4fd1a5]" />
          <span className="ml-2 flex h-[22px] grow items-center rounded-[11px] bg-[#2c2a55] px-3 text-xs text-[#b9b7e6]">
            [yourgame].example.com
          </span>
        </div>
        <GameCells cells={FEATURED_CELLS} className="grow grid-cols-16" />
      </div>

      <div className="flex flex-col justify-center gap-4 p-9">
        <span className="self-start rounded-[13px] bg-yellow px-3 py-[5px] text-[13px] font-bold text-navy">
          Featured today
        </span>
        <h2 className="text-4xl/10 font-semibold tracking-[-0.8px]">[Project name]</h2>
        <p className="m-0 text-[17px]/[26px] text-ink-soft">
          A browser game built from scratch. Describe what it does and what you learned making it,
          in a sentence or two.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STACK.map((stack) => (
            <span key={stack} className="rounded-lg bg-chip px-2.5 py-[5px] text-[13px] font-semibold">
              {stack}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="size-8 rounded-full bg-navy" />
          <b className="text-[15px]">[Creator]</b>
          <span className="text-sm text-ink-muted">with 2 collaborators</span>
        </div>
        <div className="mt-1 flex gap-2.5">
          <a href="#visit" className={`${button} gap-2 bg-navy px-6 text-white`}>
            Visit live site <ArrowUpRightIcon className="stroke-white" />
          </a>
          <a href="#details" className={`${button} border-[1.5px] border-navy px-[22px] text-navy`}>
            Details
          </a>
        </div>
      </div>
    </article>
  );
}
