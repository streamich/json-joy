import type {IRoot, TBlockToken, TInlineToken} from 'very-small-parser/lib/markdown';
import type {Flat} from 'mdast-flat/lib/types';
export * from 'very-small-parser/lib/markdown';

export type MdastNode = IRoot | TBlockToken | TInlineToken;
export interface Renderers {
  blockquote: RenderNode;
  break: RenderNode;
  children: RenderNode;
  code: RenderNode;
  delete: RenderNode;
  emphasis: RenderNode;
  footnoteDefinition: RenderNode;
  footnoteReference: RenderNode;
  footnotes: RenderNode;
  heading: RenderNode;
  icon: RenderNode;
  image: RenderNode;
  imageReference: RenderNode;
  inlineCode: RenderNode;
  inlineMath: RenderNode;
  inlineLink: RenderNode;
  mark: RenderNode;
  math: RenderNode;
  node: RenderNode;
  link: RenderNode;
  linkReference: RenderNode;
  list: RenderNode;
  listItem: RenderNode;
  paragraph: RenderNode;
  portal: RenderNode;
  root: RenderNode;
  strong: RenderNode;
  sup: RenderNode;
  sub: RenderNode;
  table: RenderNode;
  tableRow: RenderNode;
  tableCell: RenderNode;
  text: RenderNode;
  thematicBreak: RenderNode;
  underline: RenderNode;
}

export interface MdastContextValue {
  ast: Flat;
  props: MdastProps;
  expandBlock: (idx: number, url: string) => void;
  placeholdersAfter: number;
}

export type RenderNode = (
  renderers: Renderers,
  flat: Flat,
  idx: number, // Node ID.
  props: MdastProps,
  context: MdastContextValue,
) => React.ReactNode;

export interface MdastProps {
  ast: Flat;
  renderers?: Renderers;
  isCompact?: boolean;
  isFullWidth?: boolean;
  hideFootnotes?: boolean;
  maxPlaceholders?: number;
  inline?: boolean;
  inlineChildren?: boolean;

  /** Node ID to render. */
  nodeId?: number;

  /**
   * Link to redirect on placeholder click.
   */
  to?: string;

  /**
   * Base font size in pixels (font size of text in a paragraph).
   */
  fontSize?: number;

  /**
   * Whether Markdown block with just a URL can be expanded into a sub-document.
   */
  isExpandable?: (url: string) => boolean;

  /**
   * Load new Markdown document that will expand current Markdown block.
   */
  expand?: (url: string) => Promise<LoadedDocument>;

  /**
   * Placeholder rendered when a block is being loaded, for example,
   * when a single link Markdown block is being expanded.
   */
  LoadingBlock?: React.FC<{idx: number; children?: React.ReactNode}>;

  /**
   * Increase text size 2x if document contains only emojis icon and nothing else.
   */
  scaleUpEmojiSrc?: boolean;

  /**
   * Display block placeholders after this block.
   */
  placeholdersAfter?: number;

  /**
   * Display block placeholders after this length of content.
   */
  placeholdersAfterLength?: number;

  onDoubleClick?: React.MouseEventHandler;
}

export interface LoadedDocument {
  id: string;
  src?: string;
}
