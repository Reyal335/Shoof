import Image from "next/image";
import Link from "next/link";

/** The shared top bar. `current` marks the matching main-nav link (or the profile avatar) with aria-current. */
export function Header({ current }: { current?: "home" | "creators" | "profile" }) {
  return (
    <header className="top">
      <div className="top-left">
        <Link className="brand" href="/">
          <Image src="/shoof-blob.svg" alt="" width={34} height={34} priority />
          <span>Shoof</span>
        </Link>
        <nav className="topnav" aria-label="Main">
          <Link href="/" aria-current={current === "home" ? "page" : undefined}>Home</Link>
          <a href="#explore">Explore</a>
          <Link href="/creators" aria-current={current === "creators" ? "page" : undefined}>Creators</Link>
        </nav>
      </div>
      <div className="search">
        <label className="sr" htmlFor="q">Search Shoof</label>
        <input id="q" type="search" placeholder="Search sites, creators, stacks" />
      </div>
      <div className="top-right">
        <a className="post-btn" href="#post">Post a site</a>
        <Link className="me" href="/profile" aria-label="Your profile" aria-current={current === "profile" ? "page" : undefined}></Link>
      </div>
    </header>
  );
}
