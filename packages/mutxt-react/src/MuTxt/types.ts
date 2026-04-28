import type {BaseEditor} from 'slate';
import type {HistoryEditor} from 'slate-history';
import type {ReactEditor} from 'slate-react';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';

export {MenuItem};

export type SlateTextAlign = 'left' | 'center' | 'right' | 'justify';
export type MarkFormat = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'overline' | 'code' | 'mark' | 'spoiler' | 'sup' | 'sub' | 'kbd' | 'ins' | 'del';
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
export type BlockFormat = 'p' | 'columns' | HeadingElementType | 'blockquote' | 'callout' | 'code-block' | 'pre' | ListElementType;
export type BlockElementType = BlockFormat | 'li' | 'embed' | 'hr';
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
  mark?: boolean;
  spoiler?: boolean;
  sup?: boolean;
  sub?: boolean;
  kbd?: boolean;
  ins?: boolean;
  del?: boolean;
  a?: LinkAttributes;
}

export interface BlockAttributes {
  align?: SlateTextAlign;
  indent?: number;
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
  | HrElement;

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