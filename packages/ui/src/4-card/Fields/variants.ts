export type FieldVariant = 'menu' | 'block' | 'card';

/**
 * How a value cell presents editability:
 *
 * - `'live'` — the editor is always shown (immediate inputs).
 * - `'reveal'` — the value is shown read-only; clicking reveals the inline
 *   editor (focused); Escape or activating another field reverts to the view.
 * - `'view'` — the value is shown read-only; clicking fires `onActivate`
 *   (e.g. open a fuller editor elsewhere). No inline editing.
 */
export type FieldEditMode = 'live' | 'reveal' | 'view';

export interface FieldVariantPreset {
  spacing: number;
  detail: number;
  align: 'left' | 'right';
  edit: FieldEditMode;
}

/**
 * Named density presets bundling `spacing` + `detail` + `align` + `edit`.
 * Individual props on `FieldList`/`FieldRow` override the preset.
 */
export const FIELD_VARIANTS: Record<FieldVariant, FieldVariantPreset> = {
  // Compact context-menu args — today's ArgsPane look. Immediate inputs.
  menu: {spacing: 0.5, detail: 0.6, align: 'right', edit: 'live'},
  // Roomy property panel / Things block view, left-aligned.
  block: {spacing: 0.85, detail: 1, align: 'left', edit: 'live'},
  // Tight, terse Things card view: values shown, click to edit inline.
  card: {spacing: 0.25, detail: 0.3, align: 'left', edit: 'reveal'},
};
