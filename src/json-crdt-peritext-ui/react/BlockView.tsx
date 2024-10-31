import * as React from 'react';
import {LeafBlock} from '../../json-crdt-extensions/peritext/block/LeafBlock';
import {Block} from '../../json-crdt-extensions/peritext/block/Block';
import {InlineView} from './InlineView';
import {Char} from '../constants';
import {usePeritext} from './context';

export interface BlockViewProps {
  hash: number;
  block: Block;
  el?: (element: HTMLElement | null) => void;
}

export const BlockView: React.FC<BlockViewProps> = React.memo(
  (props) => {
    const {block, el} = props;
    const {renderers} = usePeritext();

    const elements: React.ReactNode[] = [];
    if (block instanceof LeafBlock) {
      for (const inline of block.texts()) elements.push(<InlineView key={inline.key()} inline={inline} />);
    } else {
      const children = block.children;
      const length = children.length;
      for (let i = 0; i < length; i++) {
        const child = children[i];
        elements.push(<BlockView key={child.key()} hash={child.hash} block={child} />);
      }
    }

    let children: React.ReactNode = (
      <div ref={(element) => el?.(element)}>{elements.length ? elements : Char.ZeroLengthSpace}</div>
    );
    for (const map of renderers) children = map.block?.(props, children) ?? children;
    return children;
  },
  (prev, next) => prev.hash === next.hash,
);
