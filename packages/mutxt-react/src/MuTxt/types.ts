import type {BaseEditor} from 'slate';
import type {HistoryEditor} from 'slate-history';
import type {ReactEditor} from 'slate-react';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';

export {MenuItem};

export type SlateTextAlign = 'left' | 'center' | 'right' | 'justify';
export type MarkFormat = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'overline' | 'code' | 'mark' | 'spoiler' | 'sup' | 'sub' | 'kbd' | 'ins' | 'del';
export type HeadingElementType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type ListElementType = 'ul' | 'ol' | 'checklist';
export type BlockFormat = 'p' | 'columns' | HeadingElementType | 'blockquote' | 'code-block' | ListElementType;
export type BlockElementType = BlockFormat | 'li' | 'embed';

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

export interface CodeBlockElement extends BlockAttributes {
  type: 'code-block';
  language?: string;
  fileName?: string;
  wrap?: number;
  showLineNumbers?: boolean;
  children: CustomText[];
}

export interface ListItemElement extends BlockAttributes {
  type: 'li';
  checked?: boolean;
  children: CustomText[];
}

export interface BulletedListElement extends BlockAttributes {
  type: 'ul';
  children: ListItemElement[];
}

export interface NumberedListElement extends BlockAttributes {
  type: 'ol';
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

export type CustomElement =
  | ParagraphElement
  | TwoColumnsElement
  | HeadingElement
  | BlockquoteElement
  | CodeBlockElement
  | ListItemElement
  | BulletedListElement
  | NumberedListElement
  | ChecklistListElement
  | EmbedElement;

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