/**
 * CSS-drawn stand-ins for site screenshots, used until posts carry real preview images.
 * Purely decorative: the caller labels the preview with role="img".
 */

/** Game palette, indexed by the digits of a `cells` string. */
const CELL_COLORS = [
  "bg-[#26335c]",
  "bg-[#2ec4b6]",
  "bg-yellow",
  "bg-[#ef6f6f]",
  "bg-field-border",
];

/** One block per digit of `cells`; `className` sets the column count and backdrop. */
export function GameCells({ cells, className }: { cells: string; className: string }) {
  return (
    <div className={`grid auto-rows-[minmax(0,1fr)] gap-[3px] ${className}`}>
      {Array.from(cells, (digit, i) => (
        <span key={i} className={`rounded-[3px] ${CELL_COLORS[Number(digit)]}`} />
      ))}
    </div>
  );
}

export function GamePreview({ cells }: { cells: string }) {
  return <GameCells cells={cells} className="h-full grid-cols-12 bg-[#1d1b3a] p-4" />;
}

export function PortfolioPreview() {
  return (
    <div className="flex h-full flex-col gap-3.5 bg-[#fbfbfd] px-[22px] py-[18px]">
      <div className="flex items-center justify-between">
        <div className="h-2 w-[54px] rounded bg-navy" />
        <div className="flex gap-2.5">
          <div className="h-1.5 w-[30px] rounded-[3px] bg-field-border" />
          <div className="h-1.5 w-[30px] rounded-[3px] bg-field-border" />
          <div className="h-1.5 w-[30px] rounded-[3px] bg-field-border" />
        </div>
      </div>
      <div className="flex grow items-center gap-4">
        <div className="flex grow flex-col gap-2.5">
          <div className="h-[18px] w-[92%] rounded-md bg-navy" />
          <div className="h-[18px] w-[66%] rounded-md bg-navy" />
          <div className="mt-2 h-[22px] w-[54px] rounded-[11px] bg-yellow" />
        </div>
        <div className="size-24 shrink-0 rounded-full bg-yellow" />
      </div>
      <div className="flex gap-2.5">
        <div className="h-[34px] grow rounded-lg bg-chip" />
        <div className="h-[34px] grow rounded-lg bg-chip" />
        <div className="h-[34px] grow rounded-lg bg-chip" />
      </div>
    </div>
  );
}

export function CssPreview() {
  return (
    <div className="flex h-full flex-col gap-3 bg-[#dfe5f2] p-[18px]">
      <div className="flex h-[60px] gap-3">
        <div className="flex-1 rounded-[10px] bg-navy" />
        <div className="flex-2 rounded-[10px] bg-yellow" />
        <div className="flex-1 rounded-[10px] bg-field-border" />
      </div>
      <div className="flex grow gap-3">
        <div className="flex-1 rounded-[10px] bg-[#9db4f0]" />
        <div className="flex grow-2 flex-col gap-3">
          <div className="grow rounded-[10px] bg-navy" />
          <div className="grow rounded-[10px] bg-white" />
        </div>
      </div>
    </div>
  );
}

/** `bars` are chart bar heights in px. */
export function SaasPreview({ bars }: { bars: number[] }) {
  return (
    <div className="flex h-full bg-ground">
      <div className="flex w-[54px] flex-col items-center gap-3 bg-navy pt-4">
        <div className="size-[22px] rounded-md bg-yellow" />
        <div className="h-1.5 w-[22px] rounded-[3px] bg-on-navy-faint" />
        <div className="h-1.5 w-[22px] rounded-[3px] bg-on-navy-faint" />
        <div className="h-1.5 w-[22px] rounded-[3px] bg-on-navy-faint" />
      </div>
      <div className="flex grow flex-col gap-3 p-4">
        <div className="flex gap-2.5">
          <div className="h-11 grow rounded-lg bg-white" />
          <div className="h-11 grow rounded-lg bg-white" />
          <div className="h-11 grow rounded-lg bg-white" />
        </div>
        <div className="flex grow items-end gap-2 rounded-lg bg-white p-3">
          {bars.map((height, i) => (
            <div key={i} className="grow rounded-t-[3px] bg-link" style={{ height }} />
          ))}
        </div>
      </div>
    </div>
  );
}
