// Stand-ins for the posted site's screenshots and the "More from" previews. They draw someone else's site, not Shoof,
// so they keep their own literal colours. `thumb` hides the art from assistive tech when it sits inside a labelled button.

const PAL = ["c0", "c0", "c0", "c1", "c2", "c3", "c4"];
const SEED = 3;
// Decorative pixel art, generated with the same formula design/Post.html used.
const PLAY_CELLS = Array.from({ length: 160 }, (_, i) =>
  PAL[Math.floor(Math.abs(Math.sin(i * 2.3 + SEED) * 3.4 + Math.cos(i * 0.7 + SEED * 1.7) * 2.6)) % 7],
);

type ShotProps = { thumb?: boolean };

export function PlayShot({ thumb }: ShotProps) {
  return (
    <div aria-hidden={thumb || undefined} className="scr s-play cells">
      {PLAY_CELLS.map((cell, i) => (
        <span key={i} className={cell} />
      ))}
    </div>
  );
}

export function TitleShot({ thumb }: ShotProps) {
  return (
    <div aria-hidden={thumb || undefined} className="scr s-title"><b /><b /><i /><u /></div>
  );
}

export function LevelsShot({ thumb }: ShotProps) {
  return (
    <div aria-hidden={thumb || undefined} className="scr s-levels"><i /><i /><i /><i /><i /><i /><i /><i /></div>
  );
}

export function ScoresShot({ thumb }: ShotProps) {
  return (
    <div aria-hidden={thumb || undefined} className="scr s-scores"><div><em /><i style={{ width: '90%' }} /></div><div><em /><i style={{ width: '76%' }} /></div><div><em /><i style={{ width: '64%' }} /></div><div><em /><i style={{ width: '52%' }} /></div><div><em /><i style={{ width: '40%' }} /></div></div>
  );
}

export function CssPreview() {
  return (
    <div className="m-css"><div><i style={{ background: '#101b33' }} /><i style={{ background: '#dba40c', flex: 2 }} /></div><div><i style={{ background: '#9db4f0' }} /><i style={{ background: '#fff', flex: 2 }} /></div></div>
  );
}

export function PortfolioPreview() {
  return (
    <div className="m-port"><b style={{ width: '40px', height: '7px' }} /><b style={{ width: '80%', marginTop: '10px' }} /><b style={{ width: '55%' }} /><em /></div>
  );
}

export function SaasPreview() {
  return (
    <div className="m-saas"><span className="sd" /><div className="mn"><i style={{ height: '40px' }} /><i style={{ height: '62px' }} /><i style={{ height: '48px' }} /><i style={{ height: '80px' }} /><i style={{ height: '66px' }} /><i style={{ height: '92px' }} /><i style={{ height: '74px' }} /></div></div>
  );
}
