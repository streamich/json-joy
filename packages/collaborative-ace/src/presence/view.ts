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

const generateColor = (str: string, alpha?: number): string =>
  new Colors().hash(str).setA(100 * (alpha ?? 1)) + '';

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
 * Caret lifecycle: dim at 50% of the duration, disappear at 100%.
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

/**
 * Label renders the user name over the caret. Bottom / top / left / right /
 * transform are set dynamically via positionLabel() so that the label avoids
 * viewport edges.
 */
const caretLabelClass = rule({
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

const caretContainerClass = rule({
  pos: 'absolute',
  pe: 'none',
  z: 5,
  [`&:hover .${caretLabelClass}`]: {
    op: 1,
    z: 20,
  },
}).trim();

/** Which horizontal edge the label is anchored to. */
export type LabelSide = 'left' | 'center' | 'right';

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
  } else if (side === 'right') {
    label.style.right = '0';
    label.style.left = 'auto';
    label.style.transform = 'none';
  } else {
    label.style.left = '50%';
    label.style.right = '';
    label.style.transform = 'translateX(-50%)';
  }
};

/**
 * Default cursor renderer — a colored caret line with a floating name label.
 * All lifecycle stages (blink, label fade, dim, disappear) are driven by CSS
 * animations so no JS timers are needed.
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

  // Outer container — absolutely positioned by AcePresence.
  const container = document.createElement('div');
  container.className = caretContainerClass;
  container.style.animation = `${lifecycleAnimation} ${hideAfterMs}ms linear forwards, ${blinkAnimation} 1s ease-in-out ${blinkIterations} forwards`;
  container.style.animationDelay = `0ms, ${-(Date.now() % 1000)}ms`;

  // Caret bar.
  const bar = document.createElement('div');
  bar.style.position = 'absolute';
  bar.style.top = '0';
  bar.style.left = '0';
  bar.style.width = '2px';
  bar.style.height = '100%';
  bar.style.backgroundColor = color;
  bar.style.setProperty('--peritext-cursor-color', color);

  // Name label.
  const label = document.createElement('div');
  label.className = caretLabelClass;
  label.style.backgroundColor = color;
  label.textContent = name;
  if (fadeAfterMs > 0) label.style.animation = `${labelFadeAnimation} 0.3s ease ${fadeAfterMs}ms forwards`;

  container.appendChild(bar);
  container.appendChild(label);
  return container;
};

// -------------------------------------------------------------- CursorManager

interface CursorEntry {
  /** The cached DOM element. */
  el: HTMLElement;
  /** Last known document offset (focus position). */
  pos: number;
  /** The label sub-element — kept for animation resets and repositioning. */
  label: HTMLElement;
}

/**
 * Manages cached cursor DOM elements keyed by remote peer id.
 *
 * By caching elements we ensure:
 *
 * 1. CSS animations survive Ace marker-layer re-renders (the same
 *    `HTMLElement` is reused).
 * 2. When a remote cursor moves, the lifecycle animation is restarted so the
 *    cursor re-appears at full opacity and the label is re-shown.
 * 3. No JS timers need to be managed — everything is CSS-driven.
 */
export class CursorManager {
  private cache = new Map<string, CursorEntry>();

  getOrCreate(
    processId: string,
    pos: number,
    isFirstLine: boolean,
    side: LabelSide,
    user: PresenceUser | undefined,
    opts: CursorRenderOpts,
    receivedAt: number,
    renderFn: CursorRenderer,
  ): HTMLElement {
    const existing = this.cache.get(processId);
    if (existing) {
      if (existing.pos !== pos) {
        existing.pos = pos;
        this.resetLifecycle(existing);
      }
      positionLabel(existing.label, isFirstLine, side);
      return existing.el;
    }
    // First time we see this peer — create the element.
    const el = renderFn(processId, user, opts);
    // If the presence data is already aged, fast-forward the lifecycle
    // animation so the cursor starts at the correct visual phase.
    const age = Date.now() - receivedAt;
    if (age > 0) el.style.animationDelay = `-${age}ms, ${-(Date.now() % 1000)}ms`;
    const label = el.querySelector(`.${caretLabelClass}`) as HTMLElement;
    positionLabel(label, isFirstLine, side);
    this.cache.set(processId, {el, pos, label});
    return el;
  }

  prune(activeIds: Set<string>): void {
    for (const [id, entry] of this.cache) {
      if (!activeIds.has(id)) {
        entry.el.remove();
        this.cache.delete(id);
      }
    }
  }

  destroy(): void {
    for (const entry of this.cache.values()) entry.el.remove();
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

/** Default selection color with transparency. */
export const selectionColor = (peerId: string, user?: PresenceUser): string =>
  user?.color ?? generateColor(peerId, 0.3);
