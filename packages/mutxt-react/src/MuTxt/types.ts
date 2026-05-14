import type {BaseEditor} from 'slate';
import type {HistoryEditor} from 'slate-history';
import type {ReactEditor} from 'slate-react';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import type {StepperItem} from './block/stepper/types';
import type {CalloutVariant} from './block/callout/settings';

export type {MenuItem};
export type {StepperItem, StepState, StepIndicator, LineStyle} from './block/stepper/types';
export type {CalloutVariant} from './block/callout/settings';

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
export type ListElementType = 'ul' | 'ol' | 'checklist' | 'stepper';
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
export type BlockElementType = BlockFormat | 'li' | 'embed' | 'hr' | 'file' | 'toc' | 'math' | SystemBlockElementType;
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
  /** Semantic flavor — picks a theme-aware accent. Defaults to `'note'`. */
  variant?: CalloutVariant;
  /** Emoji or any character used as the callout icon. */
  icon?: string;
  /** Optional title text shown next to the icon. */
  title?: string;
  /** Explicit accent color override (any CSS color). Wins over `variant`. */
  color?: string;
  /** When `true`, suppress the entire header row. */
  hideHeader?: boolean;
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


export interface ListItemElement extends BlockAttributes, StepperItem {
  type: 'li';
  /** Checkbox state, used when the parent is a `checklist`. */
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

export interface StepperListElement extends BlockAttributes {
  type: 'stepper';
  /** When `true`, render a cap row above the list summarizing progress (e.g. "3 / 7 done"). */
  progress?: boolean;
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

/** Source language for a math equation payload. */
export type MathLang = 'latex' | 'asciimath' | 'mathml';

/** Visual size of a block equation: large (display), medium, or small. */
export type MathSize = 'L' | 'M' | 'S';

/** A `Thing` representing a math equation. */
export interface MathThing extends Thing {
  '@type': 'math';
  /** Source string in `lang`. */
  val: string;
  /** Source language. Defaults to `'latex'`. */
  lang?: MathLang;
  /**
   * Default visual size for the equation. Currently only consumed by
   * inline references, block references carry their own per-element `size` override.
   */
  size?: MathSize;
  /** Human-readable display name (shown in pickers / outlines). */
  name?: string;
  /** Cross-reference key (e.g. `eq:pythagoras`) used to link to this equation. */
  label?: string;
}

/** A user-facing void block that references a `MathThing` by id. Rendered as a centered display-mode equation. */
export interface MathElement extends BlockAttributes {
  type: 'math';
  '@thing': string;
  /** Optional caption rendered below the equation. */
  caption?: string;
  /** Visual size override. */
  size?: MathSize;
  children: CustomText[];
}

/** A user-facing inline void that references a `MathThing` by id. Rendered inline in the surrounding paragraph. */
export interface MathInlineElement {
  type: 'math-inline';
  '@thing': string;
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
  | StepperListElement
  | EmbedElement
  | HrElement
  | FileElement
  | TocElement
  | MathElement
  | MathInlineElement;

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
