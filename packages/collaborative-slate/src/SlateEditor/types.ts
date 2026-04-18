import type {BaseEditor, Descendant} from 'slate';
import type {ReactEditor} from 'slate-react';

export type SlateTextAlign = 'left' | 'center' | 'right' | 'justify';
export type MarkFormat = 'bold' | 'italic' | 'underline' | 'code';
export type HeadingElementType = 'heading-one' | 'heading-two' | 'heading-three';
export type ListElementType = 'bulleted-list' | 'numbered-list';
export type BlockFormat = 'paragraph' | HeadingElementType | 'blockquote' | 'code-block' | ListElementType;
export type BlockElementType = BlockFormat | 'list-item';

export interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
}

export interface BlockAttributes {
  align?: SlateTextAlign;
}

export interface ParagraphElement extends BlockAttributes {
  type: 'paragraph';
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
  children: CustomText[];
}

export interface ListItemElement extends BlockAttributes {
  type: 'list-item';
  children: CustomText[];
}

export interface BulletedListElement extends BlockAttributes {
  type: 'bulleted-list';
  children: ListItemElement[];
}

export interface NumberedListElement extends BlockAttributes {
  type: 'numbered-list';
  children: ListItemElement[];
}

export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | BlockquoteElement
  | CodeBlockElement
  | ListItemElement
  | BulletedListElement
  | NumberedListElement;

export type SlateEditorDocument = Descendant[];

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