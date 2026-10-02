import Image from "next/image";

const WAVEFORM_BARS = [14, 24, 18, 32, 22, 36, 26, 16, 30, 20, 12, 28];

/** The navy brand panel beside the login form. Hidden at 880px and below. */
export function LoginHero() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-navy px-14 py-12 text-on-navy split:flex">
      <div className="flex items-center gap-3">
        <Image src="/shoof-blob.svg" alt="" width={40} height={40} />
        <span className="font-display text-[30px] font-semibold text-yellow">Shoof</span>
      </div>

      <div className="flex max-w-[480px] flex-col gap-7">
        <Image src="/shoof-blob.svg" alt="Shoof mascot" width={220} height={217} priority />
        {/* Not a heading: this panel is hidden on small screens, so "Log in" is the page's h1. */}
        <p className="m-0 font-display text-[52px]/[54px] font-semibold tracking-[-1.5px]">
          Good to see you again.
        </p>
        <p className="m-0 text-lg/7 text-on-navy-muted">
          Pick up where you left off: new demos, notes from other musicians and people looking to
          play.
        </p>
      </div>

      <div
        aria-hidden="true"
        className="flex max-w-[440px] items-center gap-3.5 rounded-[14px] bg-navy-raised px-4 py-3.5"
      >
        <div className="size-11 shrink-0 rounded-full bg-yellow" />
        <div className="flex grow flex-col gap-0.5">
          <span className="text-[15px] font-semibold">[Artist name]</span>
          <span className="text-[13px] text-on-navy-muted">New demo · 0:42</span>
        </div>
        <div className="flex h-9 items-center gap-[3px]">
          {WAVEFORM_BARS.map((height, i) => (
            <div key={i} className="w-1 rounded-xs bg-yellow" style={{ height }} />
          ))}
        </div>
      </div>
    </div>
  );
}
