import {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';
import {FONT_FAMILIES, isFontKind} from '../behavior/font';
import type {CustomStyle} from './types';

/**
 * Levels used by block renderers (mirror of `styles.g(N)`). Higher N
 * means the variant fades further toward the background.
 */
export const FG_LEVELS = [0, 8, 16, 18, 20, 24, 30, 32, 35, 40, 45, 50] as const;
export type FgLevel = (typeof FG_LEVELS)[number];

/**
 * Builds a `var(--mutxt-fg-NN, fallback)` reference. When the document's
 * custom `fg` is set, the `--mutxt-fg-NN` vars on the editable resolve to
 * tints of the user's color. Otherwise the fallback applies.
 */
export const fgVar = (level: FgLevel, fallback: string): string =>
  `var(--mutxt-fg-${level.toString().padStart(2, '0')}, ${fallback})`;

/**
 * Build a `var(--mutxt-lh, fallback)` reference for line-height. Use on
 * text-body blocks (paragraphs, lists, preformatted, etc.) so a
 * document-level `lh` override cascades through. Skip on blocks whose
 * line-height is part of their visual design (headings, code, math).
 */
export const lhVar = (fallback: string | number): string => `var(--mutxt-lh, ${fallback})`;

/**
 * Compute CSS-variable values for a fg/bg pair. Returns the variables as
 * kebab-cased keys so they can be sprayed directly onto an element's
 * `style.setProperty(...)` calls.
 */
export const computeFgVars = (fg?: string, bg?: string): Record<string, string> => {
  if (!fg) return {};
  const base = HslColor.from(fg);
  if (!base) return {};
  const bgColor = bg ? HslColor.from(bg) : undefined;
  const targetL = bgColor ? bgColor.l : base.l < 0.5 ? 1 : 0;
  const out: Record<string, string> = {};
  for (const level of FG_LEVELS) {
    const t = level / 100;
    const l = base.l + (targetL - base.l) * t;
    const c = new HslColor(base.h, base.s, l, 1);
    out[`--mutxt-fg-${level.toString().padStart(2, '0')}`] = c.toString();
  }
  return out;
};

/**
 * Convert a `CustomStyle` to a `React.CSSProperties` object containing only
 * the keys that are present. Used for the typography subset that flows
 * through CSS inheritance. Unset fields are silently dropped.
 */
export const toInlineCss = (cs: CustomStyle | undefined): React.CSSProperties => {
  const out: React.CSSProperties = {};
  if (!cs) return out;
  if (cs.ff !== undefined) out.fontFamily = isFontKind(cs.ff) ? FONT_FAMILIES[cs.ff] : cs.ff;
  if (cs.fz !== undefined) out.fontSize = `${cs.fz}px`;
  if (cs.fw !== undefined) out.fontWeight = cs.fw;
  if (cs.fs !== undefined) out.fontWidth = `${cs.fs}%`;
  if (cs.os !== undefined) out.fontOpticalSizing = cs.os ? 'auto' : 'none';
  if (cs.lig !== undefined) out.fontVariantLigatures = ligaturesToCss(cs.lig);
  if (cs.nv !== undefined) out.fontVariantNumeric = cs.nv === 'normal' ? 'normal' : cs.nv === 'proportional' ? 'proportional-nums' : `${cs.nv}-nums`;
  if (cs.lh !== undefined) out.lineHeight = cs.lh;
  if (cs.ls !== undefined) out.letterSpacing = `${cs.ls}em`;
  if (cs.ws !== undefined) out.wordSpacing = `${cs.ws}em`;
  if (cs.krn !== undefined) out.fontKerning = cs.krn;
  if (cs.it !== undefined) out.fontStyle = cs.it ? 'italic' : 'normal';
  if (cs.caps) out.textTransform = 'uppercase';
  if (cs.smcp) out.fontVariantCaps = 'small-caps';

  // Stored as a fraction of em so they scale with font size.
  // text-underline-offset inherits, but text-decoration-thickness does not,
  // so descendant <u> leaf elements read --mutxt-dt to pick the value up.
  if (cs.uo !== undefined) {
    const v = `${cs.uo}em`;
    out.textUnderlineOffset = v;
    (out as any)['--mutxt-uo'] = v;
  }
  if (cs.dt !== undefined) {
    const v = `${cs.dt}em`;
    out.textDecorationThickness = v;
    (out as any)['--mutxt-dt'] = v;
  }

  if (cs.fg !== undefined) out.color = cs.fg;
  if (cs.bg !== undefined) out.backgroundColor = cs.bg;
  return out;
};

const ligaturesToCss = (v: CustomStyle['lig']): string => {
  switch (v) {
    case 'none':
      return 'no-common-ligatures';
    case 'common':
      return 'common-ligatures';
    case 'discretionary':
      return 'common-ligatures discretionary-ligatures';
    case 'historical':
      return 'common-ligatures historical-ligatures';
    default:
      return 'normal';
  }
};
