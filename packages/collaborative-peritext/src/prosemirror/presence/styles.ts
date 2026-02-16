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

// -------------------------------------------------------------- CSS injection

const STYLE_ID = 'prtxt-presence-styles';

const CSS = /* css */ `
.prtxt-cursor {
  position: relative;
  border-left: 2px solid;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  word-break: normal;
}

.prtxt-cursor-label {
  position: absolute;
  bottom: 100%;
  left: -1px;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  padding: 1px 4px;
  border-radius: 3px 3px 3px 0;
  color: #fff;
  pointer-events: none;
  user-select: none;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 10;
}

.prtxt-cursor-label--faded {
  opacity: 0;
  transform: translateY(4px);
}

.prtxt-cursor:hover .prtxt-cursor-label {
  opacity: 1;
  transform: translateY(0);
  z-index: 20;
}

.prtxt-cursor--dimmed {
  opacity: 0.35;
}
`;

/**
 * Injects the default presence CSS into the document `<head>`. Safe to call
 * multiple times — subsequent calls are no-ops.
 */
export const injectStyles = (): void => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
};

// ------------------------------------------------------------ DOM builders

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
  injectStyles();
  const color = user?.color ?? generateColor(peerId);
  const name = user?.name ?? peerId.slice(0, 8);

  const el = document.createElement('span');
  el.className = 'prtxt-cursor';
  el.style.borderColor = color;

  const label = document.createElement('div');
  label.className = 'prtxt-cursor-label';
  label.style.backgroundColor = color;
  label.textContent = name;

  // Word-joiner characters prevent the zero-width span from collapsing.
  el.append('\u2060', label, '\u2060');

  // Auto-fade label after timeout; re-show on hover is CSS-driven.
  if (fadeAfterMs > 0) {
    setTimeout(() => label.classList.add('prtxt-cursor-label--faded'), fadeAfterMs);
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
    class: 'prtxt-selection',
    style: `background-color: ${color}50`,
  };
};
