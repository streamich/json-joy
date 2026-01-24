/**
 * Assumes H, S, and L are contained in the set [0, 1] and
 * returns R, G, and B in the set [0, 1].
 */
export const hsl2rgb = (H: number, S: number, L: number) => {
  let R = L,
    G = L,
    B = L;
  if (S !== 0) {
    const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
    const p = 2 * L - q;
    R = hue2rgb(p, q, H + 1 / 3);
    G = hue2rgb(p, q, H);
    B = hue2rgb(p, q, H - 1 / 3);
  }
  return [R, G, B];
};

const hue2rgb = (p: number, q: number, t: number) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  return t < 0.5 ? (t < 1 / 6 ? p + (q - p) * 6 * t : q) : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
};
