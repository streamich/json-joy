import type {LineStyle, StepIndicator, StepState} from './types';

export const DEF_STATE: StepState = 'pending';
export const DEF_INDICATOR: StepIndicator = 'number';

export const DEF_RING: LineStyle = 'solid';
export const DEF_HALO: LineStyle = 'none';
export const DEF_LINE: LineStyle = 'solid';

export const DEF_RING_WIDTH = 1;
export const DEF_HALO_WIDTH = 1;
export const DEF_LINE_WIDTH = 1;

export const DEF_RADIUS = 50;

export const INDICATOR_SIZE = 28;
export const ITEM_GAP = 14;
export const HALO_OFFSET = 4;

export const STEP_STATES: StepState[] = ['active', 'pending', 'done', 'warning', 'error', 'optional'];
export const STEP_STATE_LABEL: Record<StepState, string> = {
  active: 'Active',
  pending: 'Pending',
  done: 'Done',
  warning: 'Warning',
  error: 'Error',
  optional: 'Optional',
};

export const STEP_INDICATORS: StepIndicator[] = ['number', 'symbol', 'chars'];
export const STEP_INDICATOR_LABEL: Record<StepIndicator, string> = {
  number: 'Number',
  symbol: 'Symbol',
  chars: 'Chars',
};

export const LINE_STYLES: LineStyle[] = ['none', 'solid', 'dashed', 'dotted', 'squiggly'];
export const LINE_STYLE_LABEL: Record<LineStyle, string> = {
  none: 'None',
  solid: 'Solid',
  dashed: 'Dashed',
  dotted: 'Dotted',
  squiggly: 'Squiggly',
};

export const LINE_WIDTHS: ReadonlyArray<0 | 1 | 2 | 3 | 4 | 5 | 6> = [0, 1, 2, 3, 4, 5, 6];

const isStepState = (v?: string): v is StepState =>
  v === 'active' || v === 'pending' || v === 'done' || v === 'warning' || v === 'error' || v === 'optional';

const isStepIndicator = (v?: string): v is StepIndicator => v === 'number' || v === 'symbol' || v === 'chars';

const isLineStyle = (v?: string): v is LineStyle =>
  v === 'none' || v === 'solid' || v === 'dashed' || v === 'dotted' || v === 'squiggly';

export const getStepState = (v?: string): StepState => (isStepState(v) ? v : DEF_STATE);
export const getStepIndicator = (v?: string): StepIndicator => (isStepIndicator(v) ? v : DEF_INDICATOR);

export const getLineStyle = (v: string | undefined, fallback: LineStyle): LineStyle => (isLineStyle(v) ? v : fallback);

// Pending steps default to a dotted connector; everything else stays solid.
export const getStateLineDefault = (state: StepState): LineStyle => (state === 'pending' ? 'dotted' : DEF_LINE);

export const clampRadius = (v: unknown): number => {
  const n = Math.round(Number(v) || 0);
  if (n <= 0) return 0;
  if (n >= 100) return 100;
  return n;
};

// Map the 0-100 roundness scale to a CSS border-radius (0% square to 50% circle).
export const radiusToCss = (radius: number): string => `${clampRadius(radius) / 2}%`;

export const clampWidth = (v: unknown): 0 | 1 | 2 | 3 | 4 | 5 | 6 => {
  const n = Math.round(Number(v) || 0);
  if (n <= 0) return 0;
  if (n >= 6) return 6;
  return n as 1 | 2 | 3 | 4 | 5;
};
