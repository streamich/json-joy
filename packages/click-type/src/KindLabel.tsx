import {HslColor} from '@jsonjoy.com/ui/lib/styles/color';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import type {Styles} from '@jsonjoy.com/ui/lib/styles/Styles';
import {rule} from 'nano-theme';
import * as React from 'react';

/** Per-kind chip hue, authored for the light theme. Dark mode lifts these at render. */
const KIND_STYLE: Record<string, {col: string; bg: string}> = {
  any: {col: '#777777', bg: '#7777771a'},
  bool: {col: '#9168c8', bg: '#9168c81a'},
  con: {col: '#748a00', bg: '#748a001a'},
  num: {col: '#0a8f3f', bg: '#0a8f3f1a'},
  str: {col: '#e00e44', bg: '#e00e441a'},
  bin: {col: '#016873', bg: '#0168731a'},
  arr: {col: '#2a7fff', bg: '#2a7fff1a'},
  obj: {col: '#1d6fe0', bg: '#1d6fe01a'},
  key: {col: '#555555', bg: '#5555551a'},
  map: {col: '#1aa3a3', bg: '#1aa3a31a'},
  ref: {col: '#d2691e', bg: '#d2691e1a'},
  or: {col: '#8a4fff', bg: '#8a4fff1a'},
  fn: {col: '#c0392b', bg: '#c0392b1a'},
  fn$: {col: '#c0392b', bg: '#c0392b1a'},
  module: {col: '#444444', bg: '#4444441a'},
};

const FALLBACK = {col: '#777777', bg: '#7777771a'};

const chip = rule({
  d: 'inline-block',
  ff: 'monospace',
  fz: '11px',
  fw: 'bold',
  lh: '1',
  pd: '2px 5px',
  bdrad: '4px',
  mrr: '6px',
  va: 'middle',
  cur: 'default',
});

/**
 * Resolve a kind's chip colours for the active theme. Light mode uses the
 * authored palette verbatim; dark mode lifts the hue's lightness so dark/olive
 * hues stay legible on a dark surface, and derives a translucent tint from it.
 */
const resolveKind = (styles: Styles, kind: string): {col: string; bg: string} => {
  const base = KIND_STYLE[kind] ?? FALLBACK;
  if (styles.light) return base;
  const hsl = (HslColor.from(base.col) ?? HslColor.from('#777')!).clampL(0.62, 0.8);
  return {col: hsl.toString(), bg: new HslColor(hsl.h, hsl.s, hsl.l, 0.16).toString()};
};

export interface KindLabelProps {
  kind: string;
  /** When set, clicking the chip toggles the node's collapsed state. */
  onClick?: React.MouseEventHandler;
}

/** A small coloured monospace chip showing a schema node's `kind`. */
export const KindLabel: React.FC<KindLabelProps> = ({kind, onClick}) => {
  const styles = useStyles();
  const {col, bg} = resolveKind(styles, kind);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling is managed at the FocusProvider level
    <span className={chip} style={{color: col, background: bg}} onClick={onClick}>
      {kind}
    </span>
  );
};
