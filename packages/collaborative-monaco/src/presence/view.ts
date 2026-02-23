import {rule, keyframes} from 'nano-theme';
import {Colors} from '@jsonjoy.com/ui/lib/styles/color/Colors';

export interface PresenceUser {
  name?: string;
  color?: string;
}

export interface CursorRenderOpts {
  /** Milliseconds after which the name label is faded (default 3000). */
  fadeAfterMs?: number;
  /** Milliseconds of inactivity after which the caret is dimmed (default 30000). */
  dimAfterMs?: number;
  /** Milliseconds of inactivity after which the selection highlight is hidden
   * and the caret is dimmed (default 60000). */
  hideAfterMs?: number;
}

/** Factory that produces a cursor DOM element for a given peer. */
export type CursorRenderer = (peerId: string, user: PresenceUser | undefined, opts: CursorRenderOpts) => HTMLElement;

/** Factory that returns a CSS class name for a selection decoration. */
export type SelectionRenderer = (peerId: string, user?: PresenceUser) => string;

/** Which horizontal edge the label is anchored to. */
export type LabelSide = 'left' | 'right';

const generateColor = (str: string, alpha?: number): string => new Colors().hash(str).setA(100 * (alpha ?? 1)) + '';

// ---------------------------------------------------------------------- Caret

const blinkAnimation = keyframes({
  '0%, 100%': {borderLeftColor: 'var(--peritext-cursor-color)'},
  '50%': {borderLeftColor: 'transparent'},
});

const labelFadeAnimation = keyframes({
  from: {opacity: 1},
  to: {opacity: 0},
});

/**
 * Cursor lifecycle: dim at 50% of the duration, disappear at 100%.
 * The total duration is set via `animation-duration` in JS so the dim/hide
 * thresholds map to wall-clock seconds configured by the plugin.
 */
const lifecycleAnimation = keyframes({
  '0%': {opacity: 1},
  '49.9%': {opacity: 1},
  '50%': {opacity: 0.3},
  '99.9%': {opacity: 0.3},
  '100%': {opacity: 0},
});

const cursorLabelClass = rule({
  pos: 'absolute',
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
  d: 'inline-block',
  w: 0,
  overflow: 'visible',
  pe: 'none',
  wordBreak: 'normal',
  [`&:hover .${cursorLabelClass}`]: {
    op: 1,
    z: 20,
  },
}).trim();

const cursorBarClass = rule({
  pos: 'absolute',
  top: 0,
  left: '-1px',
  w: '2px',
  pe: 'none',
}).trim();

/** Adjust the label's CSS inline styles so it stays inside the viewport. */
export const positionLabel = (label: HTMLElement, isFirstLine: boolean, side: LabelSide): void => {
  if (isFirstLine) {
    label.style.top = 'calc(100% + 1px)';
    label.style.bottom = '';
  } else {
    label.style.bottom = 'calc(100% + 1px)';
    label.style.top = '';
  }
  if (side === 'left') {
    label.style.left = '-2px';
    label.style.right = '';
    label.style.transform = 'none';
  } else {
    label.style.right = '0';
    label.style.left = 'auto';
    label.style.transform = 'none';
  }
};

/**
 * Default cursor renderer — a colored caret line with a floating name label.
 * All lifecycle stages (blink, label fade, dim, disappear) are driven by CSS
 * animations so no JS timers are needed. The element is designed to be cached
 * and reused by {@link CursorManager} across decoration rebuilds.
 */
export const renderCursor: CursorRenderer = (
  peerId: string,
  user?: PresenceUser,
  opts?: CursorRenderOpts,
): HTMLElement => {
  const fadeAfterMs = opts?.fadeAfterMs ?? 3_000;
  const dimAfterMs = opts?.dimAfterMs ?? 30_000;
  const hideAfterMs = opts?.hideAfterMs ?? 60_000;
  const color = user?.color ?? generateColor(peerId);
  const name = user?.name ?? peerId.slice(0, 2);
  const blinkIterations = Math.ceil(dimAfterMs / 1000);
  const el = document.createElement('div');
  el.className = cursorClass;
  el.style.setProperty('--peritext-cursor-color', color);
  el.style.animation = `${lifecycleAnimation} ${hideAfterMs}ms linear forwards`;
  el.style.animationDelay = `0ms`;
  // Caret bar
  const bar = document.createElement('div');
  bar.className = cursorBarClass;
  bar.style.backgroundColor = color;
  bar.style.animation = `${blinkAnimation} 1s ease-in-out ${blinkIterations} forwards`;
  bar.style.animationDelay = `${-(Date.now() % 1000)}ms`;
  el.appendChild(bar);
  // Name label
  const label = document.createElement('div');
  label.className = cursorLabelClass;
  label.style.backgroundColor = color;
  label.textContent = name;
  if (fadeAfterMs > 0) label.style.animation = `${labelFadeAnimation} 0.3s ease ${fadeAfterMs}ms forwards`;
  el.appendChild(label);
  return el;
};

// -------------------------------------------------------------- CursorManager

interface CursorEntry {
  /** The cached DOM element. */
  el: HTMLElement;
  /** Last known Monaco offset position. */
  offset: number;
  /** The label sub-element — kept for animation resets and repositioning. */
  label: HTMLElement;
  /** The caret bar element — kept for animation resets. */
  bar: HTMLElement;
}

/**
 * Manages cached cursor DOM elements keyed by remote peer id.
 *
 * By caching elements we ensure:
 *
 * 1. CSS animations survive Monaco content widget updates (the same
 *    `HTMLElement` is returned each time).
 * 2. When a remote cursor moves, the lifecycle animation is restarted so the
 *    cursor re-appears at full opacity and the label is re-shown.
 * 3. No JS timers need to be managed — everything is CSS-driven.
 */
export class CursorManager {
  private cache = new Map<string, CursorEntry>();

  getOrCreate(
    processId: string,
    offset: number,
    lineHeight: number,
    isFirstLine: boolean,
    side: LabelSide,
    user: PresenceUser | undefined,
    opts: CursorRenderOpts,
    receivedAt: number,
    renderFn: CursorRenderer,
  ): HTMLElement {
    const existing = this.cache.get(processId);
    if (existing) {
      if (existing.offset !== offset) {
        existing.offset = offset;
        this.resetLifecycle(existing);
      }
      // Update sizing and label placement on every call (line height or
      // position may have changed).
      this.applySizing(existing, lineHeight);
      positionLabel(existing.label, isFirstLine, side);
      return existing.el;
    }
    // First time we see this peer — create the element.
    const el = renderFn(processId, user, opts);
    // If the presence data is already aged, fast-forward the lifecycle
    // animation so the cursor starts at the correct visual phase.
    const age = Date.now() - receivedAt;
    if (age > 0) el.style.animationDelay = `-${age}ms`;
    const bar = el.querySelector(`.${cursorBarClass}`) as HTMLElement;
    const label = el.querySelector(`.${cursorLabelClass}`) as HTMLElement;
    const entry: CursorEntry = {el, offset, label, bar};
    this.applySizing(entry, lineHeight);
    positionLabel(label, isFirstLine, side);
    this.cache.set(processId, entry);
    return el;
  }

  prune(activeIds: Set<string>): void {
    for (const id of this.cache.keys()) if (!activeIds.has(id)) this.cache.delete(id);
  }

  destroy(): void {
    this.cache.clear();
  }

  /** Set explicit pixel height on the container and bar so the caret is
   * visible inside a Monaco content widget (which has no inherent height). */
  private applySizing(entry: CursorEntry, lineHeight: number): void {
    const h = `${lineHeight}px`;
    entry.el.style.height = h;
    if (entry.bar) entry.bar.style.height = h;
  }

  /** Restart all CSS animations on a cached cursor so it re-appears at full
   * opacity with the label visible — called when the remote cursor moves. */
  private resetLifecycle(entry: CursorEntry): void {
    const {el, label, bar} = entry;
    for (const anim of el.getAnimations()) anim.currentTime = 0;
    if (bar) for (const anim of bar.getAnimations()) anim.currentTime = 0;
    if (label) for (const anim of label.getAnimations()) anim.currentTime = 0;
    // Re-sync blink delay to global epoch on the bar.
    if (bar) bar.style.animationDelay = `${-(Date.now() % 1000)}ms`;
  }
}

// ------------------------------------------------------------------ Selection

/** Injected `<style>` elements keyed by className, so we only inject once. */
const injectedStyles = new Map<string, HTMLStyleElement>();

/**
 * Default selection renderer — dynamically injects a `<style>` rule with a
 * semi-transparent background-color and returns the generated className. Monaco
 * decorations expect className-based styling, so we cannot use inline styles.
 */
export const renderSelection: SelectionRenderer = (peerId: string, user?: PresenceUser): string => {
  const color = user?.color ?? generateColor(peerId, 0.3);
  const cls = `json-joy-presence-sel-${peerId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  if (!injectedStyles.has(cls)) {
    const style = document.createElement('style');
    style.textContent = `.${cls} { background-color: ${color}; }`;
    document.head.appendChild(style);
    injectedStyles.set(cls, style);
  }
  return cls;
};
