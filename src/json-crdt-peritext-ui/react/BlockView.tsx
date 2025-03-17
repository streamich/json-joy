import * as React from 'react';
import {LeafBlock} from '../../json-crdt-extensions/peritext/block/LeafBlock';
import {InlineView} from './InlineView';
import {Char} from '../constants';
import {usePeritext} from './context';
import {CommonSliceType} from '../../json-crdt-extensions';
import {CaretView} from './cursor/CaretView';
import {FocusView} from './cursor/FocusView';
import {InlineAttrEnd, InlineAttrPassing, InlineAttrStart} from '../../json-crdt-extensions/peritext/block/Inline';
import {AnchorView} from './cursor/AnchorView';
import type {Block} from '../../json-crdt-extensions/peritext/block/Block';

export interface BlockViewProps {
  hash: number;
  block: Block;
  el?: (element: HTMLElement | null) => void;
}

export const BlockView: React.FC<BlockViewProps> = React.memo(
  (props) => {
    const {block, el} = props;
    const {plugins} = usePeritext();
    const elements: React.ReactNode[] = [];
    if (block instanceof LeafBlock) {
      for (const inline of block.texts()) {
        const hasCursor = inline.hasCursor();
        if (hasCursor) {
          const attr = inline.attr();
          const italic = attr[CommonSliceType.i] && attr[CommonSliceType.i][0];
          const cursorStart = inline.cursorStart();
          if (cursorStart) {
            const key = cursorStart.start.key() + '-a';
            let element: React.ReactNode;
            if (cursorStart.isStartFocused()) {
              if (cursorStart.isCollapsed()) element = <CaretView key={key} italic={!!italic} />;
              else {
                const isItalic = italic instanceof InlineAttrEnd || italic instanceof InlineAttrPassing;
                element = <FocusView key={key} italic={isItalic} />;
              }
            } else element = <AnchorView key={key} />;
            elements.push(element);
          }
        }
        elements.push(<InlineView key={inline.key()} inline={inline} />);
        if (hasCursor) {
          const cursorEnd = inline.cursorEnd();
          const attr = inline.attr();
          const italic = attr[CommonSliceType.i] && attr[CommonSliceType.i][0];
          if (cursorEnd) {
            const key = cursorEnd.end.key() + '-b';
            let element: React.ReactNode;
            if (cursorEnd.isEndFocused()) {
              if (cursorEnd.isCollapsed()) element = <CaretView key={key} italic={!!italic} />;
              else
                element = (
                  <FocusView
                    key={key}
                    left
                    italic={italic instanceof InlineAttrStart || italic instanceof InlineAttrPassing}
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
      <span ref={(element) => el?.(element)} style={{position: 'relative', display: 'block'}}>
        {elements.length ? elements : Char.ZeroLengthSpace}
      </span>
    );
    for (const map of plugins) children = map.block?.(props, children) ?? children;
    return children;
  },
  (prev, next) => prev.hash === next.hash,
);
