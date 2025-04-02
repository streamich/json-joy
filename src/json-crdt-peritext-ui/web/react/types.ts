import type * as React from 'react';
import type {FocusViewProps} from './cursor/FocusView';
import type {CaretViewProps} from './cursor/CaretView';
import type {AnchorViewProps} from './cursor/AnchorView';
import type {InlineViewProps} from './InlineView';
import type {BlockViewProps} from './BlockView';
import type {PeritextSurfaceState} from '../state';
import type {Inline} from '../../../json-crdt-extensions/peritext/block/Inline';

export interface PeritextPlugin {
  // --------------------------------------------------- Block-level formatting

  peritext?: (children: React.ReactNode, state: PeritextSurfaceState) => React.ReactNode;
  block?: (props: BlockViewProps, children: React.ReactNode) => React.ReactNode;

  // -------------------------------------------------------- Inline formatting

  inline?: (props: InlineViewProps, children: React.ReactNode) => React.ReactNode;
  text?: (props: SpanProps, inline: Inline, surface: PeritextSurfaceState) => SpanProps | undefined;

  // ------------------------------------------------------------------ Cursors

  /**
   * Renders a custom view for the *caret* (collapsed cursor) in the editor.
   *
   * Make sure that this component is treated as `{ display: inline }` by the
   * browser. Otherwise, it will break words, which will result in word
   * wrapping, and the layout will shift when the caret is moved.
   *
   * @param props Props for the caret component.
   * @param children React children that must be rendered inside the caret
   *     component. The children are the output of the `caret` renderer of the
   *     previous plugin in the chain, or the system caret if this is the first
   *     plugin in the chain.
   * @returns A react node.
   */
  caret?: (props: CaretViewProps, children: React.ReactNode) => React.ReactNode;

  /**
   * Renders a custom view for the *focus* edge of a selection
   * (range expanded cursor) in the editor. The focus edge of the selection is
   * the one that moves when the user presses the arrow keys.
   *
   * Make sure that this component is treated as `{ display: inline }` by the
   * browser. Otherwise, it will break words, which will result in word
   * wrapping, and the layout will shift when the selection is moved.
   *
   * @param props Props for the focus component.
   * @param children React children that must be rendered inside the focus
   *     component. The children are the output of the `focus` renderer of the
   *     previous plugin in the chain, or the system focus if this is the first
   *     plugin in the chain.
   * @returns A react node.
   */
  focus?: (props: FocusViewProps, children: React.ReactNode) => React.ReactNode;

  /**
   * Renders a custom view for the *anchor* edge of a selection
   * (range expanded cursor) in the editor. The anchor edge of the selection is
   * the one that stays in place when the user presses the arrow keys.
   *
   * Make sure that this component is treated as `{ display: inline }` by the
   * browser. Otherwise, it will break words, which will result in word
   * wrapping, and the layout will shift when the selection is moved.
   *
   * @param props Props for the anchor component.
   * @param children React children that must be rendered inside the anchor
   *     component. The children are the output of the `anchor` renderer of the
   *     previous plugin in the chain, or the system anchor if this is the first
   *     plugin in the chain.
   * @returns A react node.
   */
  anchor?: (props: AnchorViewProps, children: React.ReactNode) => React.ReactNode;
}

export type SpanProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
