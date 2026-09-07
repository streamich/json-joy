/**
 * Bounds on a diff computation. Every core accepts them as an optional
 * trailing argument; without them the diff is exhaustive and minimal, as it
 * has always been.
 */
export interface DiffLimits {
  /**
   * Maximum Myers edit distance explored by one bisection before the diff
   * degrades to the best split point reached so far. Deterministic: the same
   * input and the same `maxCost` give the same output on any machine.
   * Unbounded when omitted. See {@link defaultLineCost} for a sane value; the
   * bound is per bisection, so a degraded run costs about `(n + m) * maxCost`.
   * A budget that is `NaN`, negative or `0` explores nothing and leaves the
   * whole diff to the degraded split, which is bounded and coarse but never
   * unbounded — a budget computed into `NaN` must not silently buy back the
   * multi-second search this exists to prevent.
   */
  maxCost?: number;

  /**
   * Wall-clock escape hatch for interactive callers, consulted once per Myers
   * `d` iteration and only when present. Off by default: a clock makes output
   * depend on machine speed and load, and an irreproducible diff cannot be
   * tested or trusted. Degrades through the same split `maxCost` does, so an
   * expired deadline still yields a near-minimal diff rather than a trivial
   * one; what follows the deadline is then bounded by {@link deadlineLimits},
   * so this caps time spent searching, not the duration of the call.
   */
  deadline?: {isValid(): boolean};

  /**
   * Set to `true` by the callee when a bound was hit, so the result is no
   * longer guaranteed minimal. It is not a claim that the result *differs*
   * from the minimal diff — on realistic input a bounded run usually finds the
   * minimal diff anyway, and knowing otherwise would mean computing the diff
   * the bound was there to avoid. A caller reporting this to a user should say
   * the diff may not be minimal, not that it is degraded. Never written
   * otherwise, so reset it when reusing one options object across calls.
   */
  hitLimit?: boolean;
}

/** Myers cells a default-bounded diff may visit: `(n + m) * maxCost`. */
const WORK = 1 << 25;

/**
 * A bound for **line-sized elements** — `lines.diff`, or `tok.diff` over tokens
 * of comparable weight. It is invisible on realistic input and decisive on
 * pathological input: the largest power of two whose product with the input
 * size stays inside {@link WORK}, capped at 4096 and floored at 64.
 *
 * **There is no calibrated bound for the string core.** Do not reach for this
 * one: measured on a 185 KB pair of ordinary source text that is 99% identical,
 * `str.diff` at the value this returns (64) takes 2.2 s against 0.14 s
 * unbounded and emits 42x the edit volume. That is not a budget near the peak
 * behaving badly, it is the floor of this function on input whose peak is 1832;
 * the split a bounded run falls back to pairs off an eighth of the range, which
 * on nearly-identical text is pure loss, and the effect is chaotic in the
 * budget rather than monotone. Bound `str.diff` only with a value measured for
 * the input at hand, or not at all.
 *
 * @param n Number of source elements.
 * @param m Number of destination elements.
 * @returns A `maxCost` for {@link DiffLimits}.
 */
export const defaultLineCost = (n: number, m: number): number => {
  const size = n + m;
  let cost = 4096;
  while (cost > 64 && cost * size > WORK) cost >>= 1;
  return cost;
};

/**
 * What the ranges under a bail-out are diffed with once the clock has run out.
 * A clock cannot un-expire, so they cannot be given the clock: they would
 * explore nothing, and blind splitting of a range whose two sides differ in
 * length pairs off lines that do not correspond, which wrecks the tail of the
 * range. Nor can they be given the cost the search had reached, because a
 * clock is spent globally and reaches a deep range with nothing left — this is
 * measured, and it is the same wreckage.
 *
 * They get {@link defaultLineCost} instead: running out of time finishes the
 * diff as a bounded run, which is what the caller would have asked for had they
 * known. What follows the deadline is therefore bounded by the work budget,
 * not by the clock — on a pair the unbounded search cannot finish in ten
 * minutes an expired clock returns in 3.5 seconds, while on input the search
 * handles easily it costs about what the search would have. A deadline caps
 * how long is spent searching, not how long the call takes.
 *
 * That inheritance carries {@link defaultLineCost}'s calibration into the
 * string core, where it is not calibrated, and there it can invert: on a 185 KB
 * pair of nearly-identical text an expired clock costs 3.0 s against 0.14 s for
 * letting the search finish, because the ranges below are finished at 64. No
 * other inherited constant is safe either — measured both ways — so this stands
 * as the best available answer for a range that would otherwise have no budget
 * at all, and a `str.diff` caller setting a deadline should know the fallback is
 * measured for lines. On the line core it costs nothing measurable.
 *
 * @param n Length of the source range.
 * @param m Length of the destination range.
 * @returns Limits for the ranges below.
 */
export const deadlineLimits = (n: number, m: number): DiffLimits => ({maxCost: defaultLineCost(n, m)});

/** A degraded split must cover this fraction of its range; see {@link bestSplit}. */
const MIN_PROGRESS = 3; // 1/8

/**
 * The point to degrade a bounded Myers run at: the forward diagonal that got
 * furthest from the start, or the backward diagonal that got furthest from the
 * end, whichever travelled further — choice, which keeps the half on the
 * chosen side minimal. `v2` holds distances measured from the end; entries are
 * `-1` where a diagonal was never reached.
 *
 * A split that covers less than 1/8 of the range is slid further along its own
 * diagonal until it does, which is also what turns "no diagonal reached at
 * all" into a usable split rather than a delete-everything. GNU can skip this
 * because its bound never drops below 4096, but here the bound comes from the
 * caller: a split that advances by `maxCost` recurses once per `maxCost`
 * elements, which overflows the stack on large input — measured on 20k lines
 * at a 30% edit rate with `maxCost` 8. The skipped elements are paired off
 * into the sub-range and diffed there under the same bound, so nothing is
 * given up but minimality, and measured across budgets on line input it is no
 * worse than letting the split stand.
 *
 * The fraction is not tuned, and on large character input it is the wrong knob:
 * sweeping it from 1/8 to 1/128 moves the resulting cliff around by 20x in both
 * directions without removing it. What that input needs is a degradation
 * strategy that bounds recursion depth directly rather than by forcing
 * progress; see E2's follow-up.
 *
 * @param v1 Forward diagonal vector.
 * @param v2 Backward diagonal vector.
 * @param vOffset Index of diagonal `0` in both vectors.
 * @param aLen Length of the source range.
 * @param bLen Length of the destination range.
 * @returns The split point `[x, y]`, degenerate only for a range too short to
 *     slide within.
 */
export const bestSplit = (
  v1: ArrayLike<number>,
  v2: ArrayLike<number>,
  vOffset: number,
  aLen: number,
  bLen: number,
): [x: number, y: number] => {
  const length = v1.length;
  let forward = -1;
  let backward = -1;
  let fx = 0;
  let bx = 0;
  for (let i = 0; i < length; i++) {
    const k = i - vOffset;
    const f = v1[i];
    if (f >= 0) {
      let x = f > aLen ? aLen : f;
      let y = x - k;
      if (y > bLen) {
        y = bLen;
        x = y + k;
      }
      // Points outside the range: the seed entry on diagonal 1, and diagonals
      // the range does not reach. Neither is a place to split.
      if (x >= 0 && y >= 0 && x + y > forward) {
        forward = x + y;
        fx = x;
      }
    }
    const b = v2[i];
    if (b >= 0) {
      let x = b > aLen ? aLen : b;
      let y = x - k;
      if (y > bLen) {
        y = bLen;
        x = y + k;
      }
      if (x >= 0 && y >= 0 && x + y > backward) {
        backward = x + y;
        bx = x;
      }
    }
  }
  // Nothing reached, which is where a bound that expired before the first
  // iteration lands: the origin is still a point, and the slide below carries
  // it into the range. Returning it as it stands would make the whole range a
  // delete plus an insert, and every range under it too.
  if (forward < 0 && backward < 0) forward = 0;
  const min = (aLen + bLen) >> MIN_PROGRESS;
  if (backward < forward) {
    let x = fx;
    let y = forward - fx;
    if (forward < min) {
      const step = (min - forward + 1) >> 1;
      x += step;
      y += step;
      if (x > aLen) {
        y += x - aLen;
        x = aLen;
      }
      if (y > bLen) {
        x += y - bLen;
        y = bLen;
      }
      if (x > aLen) x = aLen;
    }
    return [x, y];
  }
  let x = aLen - bx;
  let y = bLen - (backward - bx);
  if (backward < min) {
    const step = (min - backward + 1) >> 1;
    x -= step;
    y -= step;
    if (x < 0) {
      y += x;
      x = 0;
    }
    if (y < 0) {
      x += y;
      y = 0;
    }
    if (x < 0) x = 0;
  }
  return [x, y];
};
