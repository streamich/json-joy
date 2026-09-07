/**
 * A field's value is not a bare scalar — it's a **source** that yields one or
 * more values, each with metadata, plus a *reason* explaining where it came
 * from. This single abstraction is what lets the value cell stay one component
 * while serving many provenance modes.
 */

export type ValueReason = 'current' | 'default' | 'computed';

export interface ValueMeta {
  /** Why this value is here. Mirrors the owning source's `reason`. */
  reason?: ValueReason;
  /**
   * Human label for where a `default` / `computed` value originates (e.g. the
   * inheriting collection, or the formula name). Shown as a hint.
   */
  origin?: string;
}

export interface SourcedValue {
  value: unknown;
  meta?: ValueMeta;
}

/** An optional resolution affordance (revert-to-default, recompute, …). */
export interface ValueAction {
  /** Short label, e.g. "Override" or "Revert". */
  label: string;
  run: () => void;
}

export interface ValueSource {
  reason: ValueReason;
  /** One entry for the single-value reasons; 2+ for diff/suggestion later. */
  values: SourcedValue[];
  /** Optional resolution actions surfaced near the value or in the popover. */
  actions?: ValueAction[];
}

/** The plain current value of a field — the common case. */
export const currentSource = (value: unknown): ValueSource => ({
  reason: 'current',
  values: [{value, meta: {reason: 'current'}}],
});
