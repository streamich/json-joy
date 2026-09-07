/** A specific projection — a rendering choice for a view/element, across the
 * *view*, *stance*, *time*, *layout*, *medium*, *chrome*, *spacing*, *detail*,
 * *overlays*, and *theme* axes. Categorical axes are string enums; the density
 * axes (*spacing*, *detail*) are continuous `[0..1]` — components quantize as
 * needed. */
export interface ViewProjection {
  /** Viewport / size the element occupies. @default 'block' */
  view?: View;
  /** What the user can do. @default 'edit' */
  stance?: Stance;
  /** Which version of the content is shown. @default 'live' */
  time?: Time;
  /** Spatial paradigm. @default 'flow' */
  layout?: Layout;
  /** Render target. @default 'screen' */
  medium?: Medium;
  /** Which UI scaffolding slots surround the content. @default 'full' */
  chrome?: Chrome;
  /**
   * Spacing / roominess, continuous `[0..1]`. `0` = tight/compact, `1` =
   * roomy/spacious. Components quantize as needed. @default 0.5
   */
  spacing?: number;
  /**
   * Information density, continuous `[0..1]` — how much each element reveals.
   * `0` = terse (value only, view-only controls), `1` = rich (full inline
   * editors + secondary info). @default 0.5
   */
  detail?: number;
  /** Content layers visible over the content. */
  overlays?: Overlays;
  /** Color scheme. @default 'system' */
  theme?: Theme;
}

/** What the user can do — the single biggest determinant of behavior. @default 'edit' */
export type Stance =
  | 'create' // For creating new content
  | 'edit' // Direct authoring; writes apply directly
  | 'view' // Passive consumption; no writes allowed
  | 'comment' // Add/edit annotations; cannot change content
  | 'suggest' // Writes become tracked suggestions, not direct edits
  | 'review'; // Accept/reject incoming suggestions; no new edits

/** Which version of the content is being rendered. Orthogonal to {@link Stance} —
 * you can `view` the past or `review` a diff of it. @default 'live' */
export type Time = 'live' | TimeAt | TimeDiff;

/** A single point in the content's history. */
export interface TimeAt {
  /** Patch ref or wall-clock timestamp. */
  at: PatchId | number;
  preserve?: unknown;
}

/** A comparison between two points (diff). Either side can be `'live'`. */
export interface TimeDiff {
  from: PatchId | 'live';
  /** `to` can also be a not-yet-applied patch. */
  to: PatchId | 'live';
  preserve?: unknown;
}

/** Reference to a specific patch in the CRDT history (op id or logical clock value). */
export type PatchId = string;

/** How content is arranged on the page. @default 'flow' */
export type Layout =
  | 'flow' // Continuous web scroll (default)
  | 'pages' // Paginated; page breaks, page numbers, headers/footers
  | 'slides' // One block per slide, presentation
  | 'reader' // Typography-optimized; narrower column, larger leading
  | 'email'; // Constrained width, inline-style-safe rendering

/** Where the output ultimately renders. Distinct from {@link Layout}
 * (pages-on-screen vs. pages-on-paper). @default 'screen' */
export type Medium =
  | 'screen' // Interactive on a display (default)
  | 'print-preview' // Print preview on screen; non-interactive, paginated
  | 'print'; // Actual print output via `@media print`

/** The viewport / size the element occupies on screen. Independent of {@link Layout}. @default 'block' */
export type View =
  | 'inline' // Inline(-block) box that flows within surrounding text (e.g. an editable token)
  | 'chip' // Inline token: a mark (icon/avatar/dot) + name, e.g. a mention or tag
  | 'icon' // A small, usually rectangular, icon
  | 'badge' // An icon + name + maybe subtitle
  | 'list' // A row in a card or list, or table
  | 'card' // A standalone card element, usually 2-4 of these fit in a block row
  | 'block' // A block-level element that occupies the full width of its container
  | 'page' // Owns a route/window/title, not maximized
  | 'window' // Like `page`, but fills the browser viewport
  | 'full'; // Uses the Fullscreen API
// | 'presentation' // Fullscreen + typically `layout: 'slides'` + `chrome: 'none'`

/** How much UI scaffolding surrounds the editable area. Either a preset or a
 * per-slot {@link ChromeSlots} map. @default 'full' */
export type Chrome =
  | 'full' // Full UI scaffolding (header, footer, all menus)
  | 'compact' // Compact UI scaffolding (no header/footer; inline + slash menus still on)
  | 'preview' // Chromeless; for read-only display
  | 'none' // Bare content; no chrome whatsoever
  | ChromeSlots;

/** Per-slot visibility of the surrounding UI. */
export interface ChromeSlots {
  header?: boolean;
  footer?: boolean;
  /** Floating in-content menus. */
  floaters?: boolean;
  /** Outer container border. */
  border?: boolean;
  // gutter?: boolean;
}

/** What content layers are visible over the content. Each key is an
 * independent toggle. */
export interface Overlays {
  comments?: CommentsOverlay;
  suggestions?: SuggestionsOverlay;
  /** Structural diff display, paired with `time: {from, to}`. */
  diff?: DiffOverlay;
  /** Other peers' cursors and selections. */
  presence?: PresenceOverlay;
  /** Ephemeral highlight as remote ops land. */
  recentEdits?: RecentEditsOverlay;
  /** Markdown syntax markers in rich view. */
  syntax?: SyntaxMarkersOverlay;
}

export type CommentsOverlay =
  | 'off' // No comment marks rendered
  | 'icons'; // Gutter icons only
// | 'expanded' // Full thread cards in margin

export type SuggestionsOverlay =
  | 'off' // Suggestions invisible
  | 'inline-marks' // Inline marks for suggestions
  | 'sidebar' // Suggestions listed in a sidebar
  | 'callouts'; // Each suggestion is a margin callout

export type SyntaxMarkersOverlay =
  | 'off' // Pure rich rendering (default)
  | 'always' // Always show **, _, #, -, > etc.
  | 'near-cursor'; // Show only on the line containing the cursor

export type RecentEditsOverlay =
  | 'off' // No indication of recent edits
  | 'flash' // 1s color-fade on each remote op's range
  | 'persistent'; // Tinted background until user marks read

/** Structural diff display, paired with `time: {from, to}`. */
export type DiffOverlay =
  | 'off' // No diff indication
  | 'inline-marks' // Strikethroughs + ins/del in body
  | 'sidebar' // Changes listed in a side panel
  | 'callouts'; // Each change is a margin callout

/** Other peers' cursors and selections. */
export type PresenceOverlay =
  | 'off' // No cursors or selections visible
  | 'caret' // Only cursors visible
  | 'ranges'; // Both caret cursors and range selections visible

/** Color scheme. @default 'system' */
export type Theme = 'light' | 'dark' | 'system' | ThemeObject;

/** A fully custom palette + token set. */
export interface ThemeObject {
  mode: 'light' | 'dark';
  colors?: Partial<ThemeColors>;
  fonts?: Partial<ThemeFonts>;
  spacing?: Partial<ThemeSpacing>;
}

export interface ThemeColors {
  bg: string;
  fg: string;
  accent: string;
  border: string;
  muted: string;
  selection: string;
}

export interface ThemeFonts {
  sans: string;
  serif: string;
  slab: string;
  mono: string;
}

export interface ThemeSpacing {
  /** Base spacing unit in px. */
  unit: number;
  /** Vertical gap between blocks in px. */
  gap: number;
}
