import Link from "next/link";
import { CssPreview, PortfolioPreview, SaasPreview } from "./stand-ins";

const STAR = "M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z";

/** Three more sites by the same creator. Every card links to the demo post for now. */
export function MoreFrom() {
  return (
    <section className="more" aria-labelledby="h-more">
      <h2 id="h-more">More from [Creator name]</h2>
      <div className="mgrid">
        <article className="mcard"><div className="mprev" role="img" aria-label="Screenshot of [Caption of another site]"><CssPreview /></div><div className="mbody"><h3><Link href="/post/demo">[Caption of another site]</Link></h3><p>A layout study built with flex and grid.</p><span className="r"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#dba40c" stroke="#a07600" strokeWidth="1.2"><path d={STAR} /></svg> 4.4</span></div></article>
        <article className="mcard"><div className="mprev" role="img" aria-label="Screenshot of [Caption of another site]"><PortfolioPreview /></div><div className="mbody"><h3><Link href="/post/demo">[Caption of another site]</Link></h3><p>Personal portfolio with case studies.</p><span className="r"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#dba40c" stroke="#a07600" strokeWidth="1.2"><path d={STAR} /></svg> 4.7</span></div></article>
        <article className="mcard"><div className="mprev" role="img" aria-label="Screenshot of [Caption of another site]"><SaasPreview /></div><div className="mbody"><h3><Link href="/post/demo">[Caption of another site]</Link></h3><p>A tool that solves one problem well.</p><span className="r"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="#dba40c" stroke="#a07600" strokeWidth="1.2"><path d={STAR} /></svg> 4.2</span></div></article>
      </div>
    </section>
  );
}
