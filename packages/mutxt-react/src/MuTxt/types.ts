import type {BaseEditor} from 'slate';
import type {HistoryEditor} from 'slate-history';
import type {ReactEditor} from 'slate-react';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';

export type {MenuItem};

export interface TextStyling {
  // --------------------------------------------------------------------- Font
  /** Font family (CSS `font-family`). */
  ff?: FontKind | string;
  /** Font size (CSS `font-size`). */
  fz?: number;
  /** Font weight (CSS `font-weight`). */
  fw?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  /** Font-stretch percent (CSS `font-stretch`). */
  fs?: number;
  /** Whether to apply `font-optical-sizing: auto`. */
  os?: boolean;
  /** Ligature mode: `'normal'` (default), `'none'`, `'common'`, `'discretionary'`, `'historical'`. */
  lig?: 'normal' | 'none' | 'common' | 'discretionary' | 'historical';
  /** Numeric variant: `'normal'`, `'lining'`, `'oldstyle'`, `'tabular'`, `'proportional'`. */
  nv?: 'normal' | 'lining' | 'oldstyle' | 'tabular' | 'proportional';

  // ------------------------------------------------------------------ Spacing
  /** Line height (CSS `line-height`). */
  lh?: number;
  /** Letter spacing in `em` (CSS `letter-spacing`). */
  ls?: number;
  /** Word spacing in `em` (CSS `word-spacing`). */
  ws?: number;
  /** Kerning: `'auto'` (default), `'normal'`, `'none'` (CSS `font-kerning`). */
  krn?: 'auto' | 'normal' | 'none';

  // -------------------------------------------------------------------- Style
  /** Italic / oblique (CSS `font-style`). */
  it?: boolean;
  /** Font caps variant (CSS `font-variant-caps`). */
  cp?: 'normal' | 'all-small-caps' | 'small-caps';
  /** Text transform (CSS `text-transform`). */
  tr: 'upper' | 'lower';
  /** Underline offset in `em` (CSS `text-underline-offset`). */
  uo?: number;
  /** Text decoration thickness in `px` (CSS `text-decoration-thickness`). */
  tdt?: number;
  /** Text underline position (CSS `text-underline-position`). */
  tup?: 'auto' | 'under';
  /** Text underline offset (CSS `text-underline-offset`). */
  tuo?: number;
  /** Text decoration color (CSS `text-decoration-color`). */
  tdc?: string;
  /** Text decoration line (CSS `text-decoration-line`). */
  tdl?: ('underline' | 'overline' | 'line-through')[];
  /** Text decoration skip ink (CSS `text-decoration-skip-ink`). */
  tdsi?: boolean;

  // --------------------------------------------------------------------- Text
  /** Text wrap (CSS `text-wrap`). */
  tw: 'balance' | 'pretty';

  // -------------------------------------------------------------------- Color
  /** Foreground text color. */
  fg?: string;
  /** Background color. */
  bg?: string;
}

export type SlateTextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * How the editor renders itself within the page.
 *
 * - `inline`: render the editor in place (default).
 * - `fullscreen`: enter native browser fullscreen.
 * - `fullwindow`: stretch to fill the entire browser window viewport.
 */
export type DisplayMode = 'inline' | 'fullscreen' | 'fullwindow';

/**
 * Document-level typeface family. Persisted at `/font` on the document object.
 *
 * - `sans`:  Inter
 * - `serif`: Source Serif 4
 * - `slab`:  Bitter
 * - `mono`:  JetBrains Mono
 */
export type FontKind = 'sans' | 'serif' | 'slab' | 'mono';

/**
 * Editable content area width preset, chosen relative to the outer shell.
 * Each preset targets a percentage of the shell width, clamped to a fixed
 * pixel range. Persisted at `/ew` on the document object.
 */
export type EditableWidth = 'narrow' | 'mid' | 'wide';

export type MarkFormat =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'overline'
  | 'code'
  | 'mark'
  | 'spoiler'
  | 'sup'
  | 'sub'
  | 'kbd'
  | 'ins'
  | 'del'
  | 'fg'
  | 'bg';

/**
 * Named slot in the highlight (`<mark>`) palette.
 */
export type MarkColor =
  | 'yellow'
  | 'lime'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'pink'
  | 'peach'
  | 'red'
  | 'purple'
  | 'gray';
export type HeadingElementType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'title' | 'subtitle';
export type ListElementType = 'ul' | 'ol' | 'checklist';
export type UlType = 'disc' | 'circle' | 'square';
export type OlType =
  | 'decimal'
  | 'decimal-leading-zero'
  | 'lower-roman'
  | 'upper-roman'
  | 'lower-alpha'
  | 'upper-alpha'
  | 'lower-greek'
  | 'hiragana'
  | 'katakana'
  | 'cjk-ideographic'
  | 'hebrew'
  | 'armenian';
export type BlockFormat =
  | 'p'
  | 'columns'
  | HeadingElementType
  | 'blockquote'
  | 'callout'
  | 'code-block'
  | 'pre'
  | ListElementType;
export type BlockElementType = BlockFormat | 'li' | 'embed' | 'hr' | 'file' | 'toc' | SystemBlockElementType;
export type SystemBlockElementType = '.things' | '.thing';
export type HrLineStyle = 'solid' | 'dashed' | 'dotted' | 'squiggly';

export interface LinkAttributes {
  href: string;
  title?: string;
}

export interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  overline?: boolean;
  code?: boolean;
  mark?: boolean | MarkColor;
  fg?: string;
  bg?: string;
  spoiler?: boolean;
  sup?: boolean;
  sub?: boolean;
  kbd?: boolean;
  ins?: boolean;
  del?: boolean;
  font?: FontKind;
  a?: LinkAttributes;
}

export interface BlockAttributes {
  align?: SlateTextAlign;
  indent?: number;
  font?: FontKind;
}

export interface ParagraphElement extends BlockAttributes {
  type: 'p';
  children: CustomText[];
}

export interface TwoColumnsElement extends BlockAttributes {
  type: 'columns';
  children: CustomText[];
}

export interface HeadingElement extends BlockAttributes {
  type: HeadingElementType;
  children: CustomText[];
}

export interface BlockquoteElement extends BlockAttributes {
  type: 'blockquote';
  children: CustomText[];
}

export interface CalloutElement extends BlockAttributes {
  type: 'callout';
  /** Emoji or any character used as the callout icon. */
  icon?: string;
  /** Optional title text shown next to the icon. */
  title?: string;
  /** Accent color. */
  color?: string;
  children: CustomText[];
}

export interface CodeBlockElement extends BlockAttributes {
  type: 'code-block';
  language?: string;
  fileName?: string;
  wrap?: number;
  showLineNumbers?: boolean;
  children: CustomText[];
}

export interface PreformattedElement extends BlockAttributes {
  type: 'pre';
  children: CustomText[];
}

export interface ListItemElement extends BlockAttributes {
  type: 'li';
  checked?: boolean;
  children: CustomText[];
}

export interface BulletedListElement extends BlockAttributes {
  type: 'ul';
  ulType?: UlType;
  children: ListItemElement[];
}

export interface NumberedListElement extends BlockAttributes {
  type: 'ol';
  olType?: OlType;
  children: ListItemElement[];
}

export interface ChecklistListElement extends BlockAttributes {
  type: 'checklist';
  children: ListItemElement[];
}

export interface EmbedElement extends BlockAttributes {
  type: 'embed';
  url: string;
  caption?: string;
  width?: number;
  children: CustomText[];
}

export interface HrElement extends BlockAttributes {
  type: 'hr';
  /** Line stroke width in CSS pixels. */
  strokeWidth?: number;
  /** Line width in percent (1..100). */
  lineWidth?: number;
  /** Line style. */
  lineStyle?: HrLineStyle;
  /** Block height in CSS pixels (controls vertical padding around the rule). */
  blockHeight?: number;
  /** Optional caption rendered between the two line halves. */
  caption?: string;
  children: CustomText[];
}

export interface TocElement extends BlockAttributes {
  type: 'toc';
  /** Optional caption displayed above the entries. */
  caption?: string;
  /** Deepest heading level to include (1..6). Defaults to 3. */
  maxLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Whether to include the document title (h0). Defaults to true. */
  includeTitle?: boolean;
  /** Show numeric prefixes. */
  numbered?: boolean;
  children: CustomText[];
}

/**
 * A schema.org-style "thing" record stored in the hidden `.things` system
 * block. The `@type` discriminator names the kind of payload; `@id` is unique
 * within the document. Other keys are domain-specific.
 */
export interface Thing {
  '@type': string;
  '@id': string;
  [key: string]: unknown;
}

/** A `Thing` representing an uploaded file. */
export interface FileThing extends Thing {
  '@type': 'file';
  name?: string;
  mimeType: string;
  size: number;
  data: Uint8Array;
}

/** A user-facing void block that references a `FileThing` by id. */
export interface FileElement extends BlockAttributes {
  type: 'file';
  '@thing': string;
  /** Optional display caption (independent of the underlying file's name). */
  caption?: string;
  children: CustomText[];
}

export type CustomElement =
  | ParagraphElement
  | TwoColumnsElement
  | HeadingElement
  | BlockquoteElement
  | CalloutElement
  | CodeBlockElement
  | PreformattedElement
  | ListItemElement
  | BulletedListElement
  | NumberedListElement
  | ChecklistListElement
  | EmbedElement
  | HrElement
  | FileElement
  | TocElement;

export type SlateEditorDocument = CustomElement[];

export interface ToolbarButtonDefinition<Format extends string = string> {
  key: string;
  title: string;
  iconSet: string;
  icon: string;
  shortcut?: string;
  format?: Format;
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
