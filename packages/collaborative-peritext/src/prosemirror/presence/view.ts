import {rule} from 'nano-theme';
import {Colors} from '@jsonjoy.com/ui/lib/styles/color/Colors';
import type {DecorationAttrs} from 'prosemirror-view';
import type {CursorRenderer, PresencePluginOpts, SelectionRenderer} from './plugin';

export interface PresenceUser {
  name?: string;
  color?: string;
}

const generateColor = (str: string, alpha?: number): string =>
  new Colors().hash(str).setA(100 * (alpha ?? 1)) + '';

// --------------------------------------------------------------------- Cursor

const cursorLabelClass = rule({
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

const labelFadedClass = rule({
  op: 0,
  transform: 'translateY(4px)',
}).trim();

const cursorClass = rule({
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

/** Default cursor renderer — a colored caret line with a floating name label. */
export const renderCursor: CursorRenderer<any> = (
  peerId: string,
  user?: PresenceUser,
  opts?: PresencePluginOpts<any>,
): HTMLElement => {
  const color = user?.color ?? generateColor(peerId);
  const name = user?.name ?? peerId.slice(0, 2);
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
  if (opts?.fadeAfterMs ?? 3_000 > 0) {
    setTimeout(() => label.classList.add(labelFadedClass), opts?.fadeAfterMs ?? 3_000);
  }
  return el;
};

// ------------------------------------------------------------------ Selection

/** Default selection renderer — a semi-transparent background color. */
export const renderSelection: SelectionRenderer = (peerId: string, user?: PresenceUser): DecorationAttrs => {
  const color = user?.color ?? generateColor(peerId, 0.3);
  return {
    style: `background-color: ${color}`,
  };
};
