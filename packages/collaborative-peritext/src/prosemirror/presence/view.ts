import {rule, keyframes} from 'nano-theme';
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

const blinkAnimation = keyframes({
  '0%, 100%': {borderLeftColor: 'var(--peritext-cursor-color)'},
  '50%': {borderLeftColor: 'transparent'},
});

const labelFadeAnimation = keyframes({
  from: {opacity: 1, transform: 'translateX(-50%) translateY(0)'},
  to: {opacity: 0, transform: 'translateX(-50%) translateY(4px)'},
});

/** Cursor lifecycle: dim at 50% of the duration, disappear at 100%.
 * The total duration is set via `animation-duration` in JS so the dim/hide
 * thresholds map to wall-clock seconds configured by the plugin. */
const lifecycleAnimation = keyframes({
  '0%': {opacity: 1},
  '49.9%': {opacity: 1},
  '50%': {opacity: 0.3},
  '99.9%': {opacity: 0.3},
  '100%': {opacity: 0},
});

const cursorLabelClass = rule({
  pos: 'absolute',
  bottom: 'calc(100% + 1px)',
  left: '50%',
  transform: 'translateX(-50%) translateY(0)',
  whiteSpace: 'nowrap',
  fz: '11px',
  fontWeight: 600,
  lineHeight: 1.2,
  pd: '1px 4px',
  bdrad: '3px',
  col: '#fff',
  pe: 'none',
  us: 'none',
  op: 1,
  z: 10,
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
    transform: 'translateX(-50%) translateY(0)',
    z: 20,
  },
}).trim();

/**
 * Default cursor renderer — a colored caret line with a floating name label.
 * All lifecycle stages (blink, label fade, dim, disappear) are driven by CSS
 * animations so no JS timers are needed. The element is designed to be cached
 * and reused by {@link CursorManager} across decoration rebuilds.
 */
export const renderCursor: CursorRenderer<any> = (
  peerId: string,
  user?: PresenceUser,
  opts?: PresencePluginOpts<any>,
): HTMLElement => {
  const fadeAfterMs = opts?.fadeAfterMs ?? 3_000;
  const dimAfterMs = opts?.dimAfterMs ?? 30_000;
  const hideAfterMs = opts?.hideAfterMs ?? 60_000;
  const color = user?.color ?? generateColor(peerId);
  const name = user?.name ?? peerId.slice(0, 2);
  const blinkIterations = Math.ceil(dimAfterMs / 1000);
  const el = document.createElement('span');
  el.className = cursorClass;
  el.style.borderColor = color;
  el.style.setProperty('--peritext-cursor-color', color);
  el.style.animation = `${lifecycleAnimation} ${hideAfterMs}ms linear forwards, ${blinkAnimation} 1s ease-in-out ${blinkIterations} forwards`;
  el.style.animationDelay = `0ms, ${-(Date.now() % 1000)}ms`;
  const label = document.createElement('div');
  label.className = cursorLabelClass;
  label.style.backgroundColor = color;
  label.textContent = name;
  if (fadeAfterMs > 0)
    label.style.animation = `${labelFadeAnimation} 0.3s ease ${fadeAfterMs}ms forwards`;
  el.append('\u2060', label, '\u2060');
  return el;
};

// -------------------------------------------------------------- CursorManager

interface CursorEntry {
  /** The cached DOM element. */
  el: HTMLElement;
  /** Last known ProseMirror widget position. */
  pos: number;
  /** The label sub-element (for hover re-reveal). */
  label: HTMLElement;
}

/**
 * Manages cached cursor DOM elements keyed by remote peer id.
 *
 * By caching elements we ensure:
 *
 * 1. CSS animations survive ProseMirror decoration rebuilds (the same
 *    `HTMLElement` is returned from the `toDOM` factory).
 * 2. When a remote cursor moves, the lifecycle animation is restarted so the
 *    cursor re-appears at full opacity and the label is re-shown.
 * 3. No JS timers need to be managed — everything is CSS-driven.
 */
export class CursorManager<Meta extends object = object> {
  private cache = new Map<string, CursorEntry>();

  getOrCreate(
    processId: string,
    pos: number,
    user: PresenceUser | undefined,
    opts: PresencePluginOpts<Meta>,
    receivedAt: number,
    renderFn: CursorRenderer<Meta>,
  ): HTMLElement {
    const existing = this.cache.get(processId);
    if (existing) {
      if (existing.pos !== pos) {
        existing.pos = pos;
        this.resetLifecycle(existing);
      }
      return existing.el;
    }
    // First time we see this peer — create the element.
    const el = renderFn(processId, user, opts);
    // If the presence data is already aged, fast-forward the lifecycle
    // animation so the cursor starts at the correct visual phase.
    const age = Date.now() - receivedAt;
    if (age > 0) {
      // A negative animation-delay makes the animation start mid-way.
      // The first value is for the lifecycle animation; the second for blink.
      el.style.animationDelay = `-${age}ms, ${-(Date.now() % 1000)}ms`;
    }
    const label = el.querySelector(`.${cursorLabelClass}`) as HTMLElement;
    this.cache.set(processId, {el, pos, label});
    return el;
  }

  prune(activeIds: Set<string>): void {
    for (const id of this.cache.keys())
      if (!activeIds.has(id)) this.cache.delete(id);
  }

  destroy(): void {
    this.cache.clear();
  }

  /** Restart all CSS animations on a cached cursor so it re-appears at full
   * opacity with the label visible — called when the remote cursor moves. */
  private resetLifecycle(entry: CursorEntry): void {
    const {el, label} = entry;
    for (const anim of el.getAnimations()) anim.currentTime = 0;
    if (label) for (const anim of label.getAnimations()) anim.currentTime = 0;

    // Re-sync blink delay to global epoch.
    const parts = (el.style.animationDelay || '').split(',');
    parts[1] = ` ${-(Date.now() % 1000)}ms`;
    el.style.animationDelay = parts.join(',');
  }
}

// ------------------------------------------------------------------ Selection

/** Default selection renderer — a semi-transparent background color. */
export const renderSelection: SelectionRenderer = (peerId: string, user?: PresenceUser): DecorationAttrs => {
  const color = user?.color ?? generateColor(peerId, 0.3);
  return {
    style: `background-color: ${color}`,
  };
};
