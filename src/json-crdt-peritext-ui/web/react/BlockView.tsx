import * as React from 'react';
import {createElement as h} from 'react';
import {LeafBlock} from '../../../json-crdt-extensions/peritext/block/LeafBlock';
import {InlineView} from './InlineView';
import {Char} from '../constants';
import {usePeritext} from './context';
import {CommonSliceType} from '../../../json-crdt-extensions';
import {CaretView} from './cursor/CaretView';
import {FocusView} from './cursor/FocusView';
import {
  type Inline,
  InlineAttrEnd,
  InlineAttrPassing,
  InlineAttrStart,
} from '../../../json-crdt-extensions/peritext/block/Inline';
import {AnchorView} from './cursor/AnchorView';
import type {Block} from '../../../json-crdt-extensions/peritext/block/Block';

export interface BlockViewProps {
  hash: number;
  block: Block;
  el?: (element: HTMLElement | null) => void;
}

export const BlockView: React.FC<BlockViewProps> = React.memo(
  (props) => {
    const {block, el} = props;
    const {plugins, dom} = usePeritext();
    const elements: React.ReactNode[] = [];
    if (block instanceof LeafBlock) {
      let inline: Inline<string> | undefined;
      let prevInline: Inline<string> | undefined;
      for (const iterator = block.texts0(); (inline = iterator()); prevInline = inline) {
        const k = inline.key();
        const hasCursor = inline.hasCursor();

        // Insert cursor before the inline text element.
        if (hasCursor) {
          const attr = inline.attr();
          const italic = attr[CommonSliceType.i]?.[0];
          const cursorStart = inline.cursorStart();
          if (cursorStart) {
            const key = k + '-a';
            let element: React.ReactNode;
            if (cursorStart.isStartFocused()) {
              if (cursorStart.isCollapsed()) {
                element = (
                  <CaretView
                    key={key}
                    italic={!!italic}
                    point={cursorStart.start}
                    cursor={cursorStart}
                    fwd={inline}
                    bwd={prevInline}
                  />
                );
              } else {
                const isItalic = italic instanceof InlineAttrEnd || italic instanceof InlineAttrPassing;
                element = <FocusView key={key} italic={isItalic} cursor={cursorStart} />;
              }
            } else element = <AnchorView key={key} />;
            elements.push(element);
          }
        }

        // Insert the inline text element itself.
        const currInlineProps = {key: k, inline};
        elements.push(h(InlineView, currInlineProps));

        // Insert cursor after the inline text element.
        if (hasCursor) {
          const cursorEnd = inline.cursorEnd();
          const attr = inline.attr();
          const italic = attr[CommonSliceType.i]?.[0];
          if (cursorEnd) {
            const key = k + '-b';
            let element: React.ReactNode;
            if (cursorEnd.isEndFocused()) {
              if (cursorEnd.isCollapsed()) {
                element = (
                  <CaretView key={key} italic={!!italic} point={cursorEnd.start} cursor={cursorEnd} bwd={inline} />
                );
              } else
                element = (
                  <FocusView
                    key={key}
                    left
                    italic={italic instanceof InlineAttrStart || italic instanceof InlineAttrPassing}
                    cursor={cursorEnd}
                  />
                );
            } else element = <AnchorView key={key} />;
            elements.push(element);
          }
        }
      }
    } else {
      const children = block.children;
      const length = children.length;
      for (let i = 0; i < length; i++) {
        const child = children[i];
        elements.push(<BlockView key={child.key()} hash={child.hash} block={child} />);
      }
    }

    let children: React.ReactNode = (
      <span
        ref={(element) => {
          el?.(element);
          if (block instanceof LeafBlock) {
            const blockId = block.start.id;
            const blocks = dom.blocks;
            if (element) blocks.set(blockId, element);
            else blocks.del(blockId);
          }
        }}
        style={{position: 'relative', display: 'block'}}
      >
        {elements.length ? elements : Char.ZeroLengthSpace}
      </span>
    );
    for (const map of plugins) children = map.block?.(props, children) ?? children;
    return children;
  },
  (prev, next) => prev.hash === next.hash,
);
