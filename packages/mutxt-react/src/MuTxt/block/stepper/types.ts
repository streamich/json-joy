/** Lifecycle state of an individual stepper item. Each state maps to a semantic color. */
export type StepState = 'active' | 'pending' | 'done' | 'warning' | 'error' | 'optional';

/** Visual indicator drawn at each step in a stepper list. */
export type StepIndicator = 'number' | 'symbol' | 'chars';

export type LineStyle = 'none' | 'solid' | 'dashed' | 'dotted' | 'squiggly';

export interface StepperItem {
  // ----------------------------------------------------------------- Behavior
  /** Lifecycle state of this step (stepper only). Defaults to `'pending'`. This
   * is the semantic setting, which defines the default color of the step's
   * indicator and line. It can be overridden by style settings. */
  stepState?: StepState;
  /** What is rendered inside the bullet (number / dot / check / characters). */
  stepIndicator?: StepIndicator;
  /** Custom 1-2 characters supplied by user. Overrides the `stepIndicator`,
   * those 1-2 characters are shown instead of the default bullet/number/check. */
  stepChar?: string;

  // ------------------------------------------------------------ Extra content
  /** Optional bold title rendered above the step body. */
  stepTitle?: string;
  /** Optional sub-text rendered between the title and the step body. */
  stepDesc?: string;

  // ------------------------------------------------------------------ Styling

  /** Custom glyph (text/icon) color inside the step indicator. If not
   * specified, contrasts automatically against the resolved background. */
  stepCol?: string;

  /** Custom background color of the step indicator. If not specified, light
   * semi-transparent grey is used or semantic (based on `stepState`) solid fill. */
  stepBg?: string;

  /** Inner ring line style override. */
  ring?: LineStyle;
  /** Inner ring color override. */
  ringCol?: string;
  /** Inner ring stroke width override. In px. */
  ringWidth?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  /** Outer ring, *halo* line style style. */
  halo?: LineStyle;
  /** Outer ring, *halo* color. */
  haloCol?: string;
  /** Outer ring, *halo* stroke width. In px. */
  haloWidth?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  /** Connector line style. */
  line?: LineStyle;
  lineCol?: string;
  lineWidth?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
