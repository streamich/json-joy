import type {BaseEditor, Descendant} from 'slate';
import type {ReactEditor} from 'slate-react';

export type SlateTextAlign = 'left' | 'center' | 'right' | 'justify';
export type MarkFormat = 'bold' | 'italic' | 'underline' | 'code';
export type HeadingElementType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type ListElementType = 'ul' | 'ol';
export type BlockFormat = 'p' | 'columns' | HeadingElementType | 'blockquote' | 'code-block' | ListElementType;
export type BlockElementType = BlockFormat | 'li';

export interface LinkAttributes {
  href: string;
  title?: string;
}

export interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  a?: LinkAttributes;
}

export interface BlockAttributes {
  align?: SlateTextAlign;
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
  children: CustomText[];
}

export interface ListItemElement extends BlockAttributes {
  type: 'li';
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

export type CustomElement =
  | ParagraphElement
  | TwoColumnsElement
  | HeadingElement
  | BlockquoteElement
  | CodeBlockElement
  | ListItemElement
  | BulletedListElement
  | NumberedListElement;

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
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}