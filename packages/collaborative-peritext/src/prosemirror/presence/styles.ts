import {rule} from 'nano-theme';
import type {DecorationAttrs} from 'prosemirror-view';

// -------------------------------------------------------------------- Colors

/**
 * Deterministic color for a peer ID. Returns a CSS hex color string.
 */
export const generateColor = (peerId: string): string => {
  let hash = 0;
  for (let i = 0; i < peerId.length; i++) hash = (hash * 31 + peerId.charCodeAt(i)) | 0;
  const h = ((hash % 360) + 360) % 360;
  return `hsl(${h}, 70%, 45%)`;
};

// ----------------------------------------------------------------- CSS rules

/** Class name for the floating name label inside a cursor widget. */
export const cursorLabelClass = rule({
  pos: 'absolute',
  bottom: '100%',
  left: '-1px',
  whiteSpace: 'nowrap',
  fz: '11px',
  fontWeight: 600,
  lineHeight: 1.2,
  pd: '1px 4px',
  bdrad: '3px 3px 3px 0',
  col: '#fff',
  pe: 'none',
  us: 'none',
  op: 1,
  transform: 'translateY(0)',
  transition: 'opacity 0.3s ease, transform 0.3s ease',
  z: 10,
}).trim();

/** Toggled on the label after `fadeAfterMs` to auto-hide it. */
export const labelFadedClass = rule({
  op: 0,
  transform: 'translateY(4px)',
}).trim();

/** Class name for the cursor caret span. */
export const cursorClass = rule({
  pos: 'relative',
  bdl: '2px solid',
  ml: '-1px',
  mr: '-1px',
  pe: 'none',
  wordBreak: 'normal',
  [`&:hover .${cursorLabelClass}`]: {
    op: 1,
    transform: 'translateY(0)',
    z: 20,
  },
}).trim();

/** Toggled on the cursor span when the peer is inactive. */
export const cursorDimmedClass = rule({
  op: 0.35,
}).trim();

// ------------------------------------------------------------ DOM builders

/**
 * Convert a CSS color to one with a given alpha. Handles `hsl()` and hex
 * formats; for anything else the color is returned unchanged.
 */
const withAlpha = (color: string, alpha: number): string => {
  if (color.startsWith('hsl('))
    return 'hsla(' + color.slice(4, -1) + ', ' + alpha + ')';
  if (color.startsWith('#') && color.length === 7)
    return color + Math.round(alpha * 255).toString(16).padStart(2, '0');
  return color;
};

export interface PresenceUser {
  name?: string;
  color?: string;
}

/**
 * Default cursor builder — a colored caret line with a floating name label
 * that auto-hides after `fadeAfterMs`.
 */
export const defaultCursorBuilder = (
  peerId: string,
  user?: PresenceUser,
  fadeAfterMs: number = 3_000,
): HTMLElement => {
  const color = user?.color ?? generateColor(peerId);
  const name = user?.name ?? peerId.slice(0, 8);

  const el = document.createElement('span');
  el.className = cursorClass;
  el.style.borderColor = color;

  const label = document.createElement('div');
  label.className = cursorLabelClass;
  label.style.backgroundColor = color;
  label.textContent = name;

  // Word-joiner characters prevent the zero-width span from collapsing.
  el.append('\u2060', label, '\u2060');

  // Auto-fade label after timeout; re-show on hover is CSS-driven.
  if (fadeAfterMs > 0) {
    setTimeout(() => label.classList.add(labelFadedClass), fadeAfterMs);
  }

  return el;
};

/**
 * Default selection highlight attrs — semi-transparent background using the
 * peer color with ~30 % opacity via hex alpha suffix.
 */
export const defaultSelectionBuilder = (
  peerId: string,
  user?: PresenceUser,
): DecorationAttrs => {
  const color = user?.color ?? generateColor(peerId);
  return {
    style: `background-color: ${withAlpha(color, 0.3)}`,
  };
};
