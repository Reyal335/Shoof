import Image from "next/image";
import Link from "next/link";

export function FeedHeader() {
  return (
    <header className="sticky top-0 z-2 flex h-[68px] items-center justify-between gap-6 border-b border-card-border bg-white px-4 tablet:px-8">
      <div className="flex items-center gap-7">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image src="/shoof-blob.svg" alt="" width={34} height={34} priority />
          <span className="font-display text-[26px] font-semibold text-navy">Shoof</span>
        </Link>
        <nav aria-label="Main" className="hidden gap-5 tablet:flex">
          <Link href="/" aria-current="page" className={navLink}>
            Home
          </Link>
          <a href="#explore" className={navLink}>
            Explore
          </a>
          <a href="#creators" className={navLink}>
            Creators
          </a>
        </nav>
      </div>
      <div className="hidden max-w-[420px] grow tablet:block">
        <label htmlFor="q" className="sr-only">
          Search Shoof
        </label>
        <input
          id="q"
          type="search"
          placeholder="Search sites, creators, stacks"
          className="h-11 w-full rounded-[22px] border-[1.5px] border-field-border bg-ground px-5 text-[15px] text-ink"
        />
      </div>
      <div className="flex items-center gap-3.5">
        <a
          href="#post"
          className="flex h-[42px] items-center justify-center rounded-[21px] bg-yellow px-5 font-display text-[15px] font-bold text-navy no-underline"
        >
          Post a site
        </a>
        <Link href="/profile" aria-label="Your profile" className="block size-10 rounded-full bg-navy" />
      </div>
    </header>
  );
}

const navLink =
  "border-b-3 border-transparent py-1 text-[15px] font-semibold text-navy no-underline aria-[current=page]:border-yellow";
