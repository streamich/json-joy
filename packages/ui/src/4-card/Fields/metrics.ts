/**
 * Singleton-popup scope shared by all field-row popups.
 */
export const FIELD_POPUP_SCOPE = 'field-popup';

/** Full row height (px) for a `spacing` in `[0..1]` — the vertical rhythm. */
export const rowHeightFor = (spacing: number): number => Math.round(22 + spacing * 20);

/**
 * Height cap (px) for the clickable key/value ghost buttons. Rows taller than
 * this turn the extra height into vertical padding: the buttons stay a
 * comfortable size, centered, and the row keeps its roomy spacing.
 */
export const BUTTON_MAX_HEIGHT = 36;

/** Height (px) of the clickable key/value ghost buttons — the row height capped at {@link BUTTON_MAX_HEIGHT}. */
export const buttonHeightFor = (spacing: number): number => Math.min(rowHeightFor(spacing), BUTTON_MAX_HEIGHT);

/** Definition-cell label font size (px) for a `spacing` in `[0..1]`. */
export const labelFontFor = (spacing: number): number => Math.round(13 + spacing * 2);

/**
 * Border radius (px) of the ghost key/value buttons for a `roundness` in
 * `[0..1]`. Default roundness `0.5` maps to `7px` — slightly rounder than the old flat `5px`.
 */
export const buttonRadiusFor = (roundness: number): number => Math.round(2 + roundness * 10);
