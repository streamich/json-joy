import {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';
import type {MarkColor} from '../types';

const REG_VALID = /^#?([0-9A-F]{3}|([0-9A-F]{6}([0-9a-f]{2})?))$/i;

export const isValidColor = (color: string): boolean => REG_VALID.test(color);

const toHex = (color: HslColor): string => color.toRgb().hex().toUpperCase();

export const normalizeHex = (color: string): string => {
  let v = color.trim();
  if (!v) return v;
  if (v[0] !== '#') v = '#' + v;
  if (v.length === 4) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
  return v.toUpperCase();
};

const MARK_HUE: Record<MarkColor, number> = {
  yellow: 50 / 360,
  lime: 75 / 360,
  green: 130 / 360,
  cyan: 175 / 360,
  blue: 210 / 360,
  pink: 320 / 360,
  peach: 20 / 360,
  red: 0,
  purple: 270 / 360,
  gray: 0,
};

const MARK_GRAY: MarkColor = 'gray';

export const MARK_SLOTS: MarkColor[] = [
  'yellow',
  'lime',
  'green',
  'cyan',
  'blue',
  'pink',
  'peach',
  'red',
  'purple',
  'gray',
];

export const MARK_SLOT_LABEL: Record<MarkColor, string> = {
  yellow: 'Yellow',
  lime: 'Lime',
  green: 'Green',
  cyan: 'Cyan',
  blue: 'Blue',
  pink: 'Pink',
  peach: 'Peach',
  red: 'Red',
  purple: 'Purple',
  gray: 'Gray',
};

/** Background fill for a mark slot, theme-aware. */
export const markSlotBg = (slot: MarkColor, dark: boolean): string => {
  const hue = MARK_HUE[slot];
  if (slot === MARK_GRAY)
    return dark ? new HslColor(0, 0, 0.32, 0.85).toString() : new HslColor(0, 0, 0.85, 0.95).toString();
  if (dark) return new HslColor(hue, 0.7, 0.32, 0.7).toString();
  return new HslColor(hue, 0.95, 0.78, 0.95).toString();
};

/** Foreground text color shown on top of `markSlotBg`. */
export const markSlotFg = (_slot: MarkColor, dark: boolean): string => (dark ? '#FFFFFF' : '#1A1A1A');

export const QUICK_PALETTE: string[] = (() => {
  const rows = 3;
  const cols = 10;
  const out: string[] = [];
  const lightness = [0.88, 0.62, 0.36];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c === 0) {
        // Monochrome column.
        const l = r === 0 ? 1 : r === 1 ? 0.55 : 0;
        out.push(toHex(new HslColor(0, 0, l)));
        continue;
      }
      const hue = ((c - 1) / (cols - 1)) * 0.95;
      const sat = r === 0 ? 0.7 : r === 1 ? 0.7 : 0.65;
      out.push(toHex(new HslColor(hue, sat, lightness[r])));
    }
  }
  return out;
})();

export const QUICK_PALETTE_COLS = 10;
export const QUICK_PALETTE_ROWS = 3;

export interface RecommendCombo {
  fg: string;
  bg: string;
}

export const RECOMMEND_PALETTE: RecommendCombo[] = (() => {
  const out: RecommendCombo[] = [];
  const cols = 10;
  // Row 0: dark text on light pastel fill.
  for (let c = 0; c < cols; c++) {
    if (c === 0) {
      out.push({fg: '#1A1A1A', bg: toHex(new HslColor(0, 0, 0.96))});
      continue;
    }
    const hue = ((c - 1) / (cols - 1)) * 0.95;
    out.push({fg: toHex(new HslColor(hue, 0.55, 0.28)), bg: toHex(new HslColor(hue, 0.85, 0.92))});
  }
  // Row 1: light text on saturated fill.
  for (let c = 0; c < cols; c++) {
    if (c === 0) {
      out.push({fg: '#FFFFFF', bg: toHex(new HslColor(0, 0, 0.18))});
      continue;
    }
    const hue = ((c - 1) / (cols - 1)) * 0.95;
    out.push({fg: '#FFFFFF', bg: toHex(new HslColor(hue, 0.65, 0.45))});
  }
  return out;
})();

export const TEXT_PALETTE: string[] = (() => {
  const cols = 10;
  const out: string[] = [];
  for (let c = 0; c < cols; c++) {
    if (c === 0) {
      out.push('#1A1A1A');
      continue;
    }
    const hue = ((c - 1) / (cols - 1)) * 0.95;
    out.push(toHex(new HslColor(hue, 0.7, 0.42)));
  }
  return out;
})();
