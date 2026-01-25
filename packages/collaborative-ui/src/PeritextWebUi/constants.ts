export enum Char {
  ZeroLengthSpace = '\uFEFF',
}

export enum ElementAttr {
  InlineOffset = '__jsonjoy.com',
}

export enum CssClass {
  /** The whole editor. */
  Editor = 'jsonjoy-peritext-editor',
  /** Editable area of the editor, beginning of the root block. */
  Editable = 'jsonjoy-peritext-editable',
  /** Portal for overlay rendering, stacks z-index over "Editable" area. */
  Overlays = 'jsonjoy-peritext-overlays',
  /** Inline editable areas. */
  Inline = 'jsonjoy-peritext-inline',
}
