// Numbers for the CSS-drawn stand-ins posts show until they have screenshots. Seeded by the post id, so a post
// always draws the same picture (on the server and in the browser) and neighbouring cards look different.

/** A small stable number from a string. */
export function seedOf(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 9973;
  return hash;
}

const CELL_PALETTE = ["c0", "c0", "c0", "c1", "c2", "c3", "c4"];

/** Pixel-grid cell classes (c0..c4), the same sin/cos formula the design files use. */
export function gameCells(seed: number, count: number): string[] {
  const s = (seed % 50) / 7;
  return Array.from({ length: count }, (_, i) => {
    const v = Math.abs(Math.sin(i * 2.3 + s) * 3.4 + Math.cos(i * 0.7 + s * 1.7) * 2.6);
    return CELL_PALETTE[Math.floor(v) % 7];
  });
}

/** Chart bar heights in px between min and max. */
export function chartBars(seed: number, count: number, min: number, max: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const v = (Math.sin(seed * 0.37 + i * 1.3) + 1) / 2;
    return Math.round(min + v * (max - min));
  });
}

/** One of `options`, picked by the seed. */
export function pick<T>(seed: number, options: readonly T[]): T {
  return options[seed % options.length];
}
