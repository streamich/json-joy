/**
 * Seeded PRNG (mulberry32) for reproducible fuzz tests. Set `DIFF_SEED` to
 * replay a run; failing tests print the seed.
 */
export const seed = Number(process.env.DIFF_SEED) || Math.floor(Math.random() * 0x7fffffff);

let state = seed;

export const random = (): number => {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const int = (max: number): number => Math.floor(random() * max);

export const pick = <T>(arr: T[]): T => arr[int(arr.length)];

export const logSeed = (info: Record<string, unknown>): void => {
  console.log('DIFF_SEED=' + seed, JSON.stringify(info));
};
