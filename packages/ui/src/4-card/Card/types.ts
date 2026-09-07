/** The surrounding surface treatment of a card. */
export type Surface =
  /** Solid face: background + hairline border + resting shadow. The default. */
  | 'paper'
  /** Transparent face with a stronger hairline border, no shadow. */
  | 'outline'
  /** Transparent until hovered, then border + shadow appear. */
  | 'ghost'
  /** No frame at all — the shell only lays out its slots. */
  | 'bare';

export type Density = 'comfortable' | 'compact' | 'dense';
export type Orientation = 'vertical' | 'horizontal';
export type Tone = 'default' | 'error' | 'warning' | 'success' | 'info';
