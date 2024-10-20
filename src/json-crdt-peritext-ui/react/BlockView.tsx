import * as React from 'react';
import {LeafBlock} from '../../json-crdt-extensions/peritext/block/LeafBlock';
import {Block} from '../../json-crdt-extensions/peritext/block/Block';
import {InlineView} from './InlineView';
import {Char} from '../constants';

// const blockClass = rule({
//   whiteSpace: 'pre-wrap',
//   wordWrap: 'break-word',
// });

export interface BlockViewProps {
  hash: number;
  block: Block;
  el?: (element: HTMLElement | null) => void;
}

export const BlockView: React.FC<BlockViewProps> = React.memo(
  ({block, el}) => {

    const elements: React.ReactNode[] = [];
    if (block instanceof LeafBlock) {
      for (const inline of block.texts())
        elements.push(<InlineView key={inline.key()} inline={inline} />);
    } else {
      const children = block.children;
      const length = children.length;
      for (let i = 0; i < length; i++) {
        const child = children[i];
        elements.push(<BlockView key={child.key()} hash={child.hash} block={child} />);
      }
    }

    return (
      <div ref={(element) => el?.(element)}>
        <div contentEditable={false} style={{margin: '16px 0 8px'}}>
          <span style={{fontSize: '0.7em', background: 'rgba(0,0,0,.1)', display: 'inline-block'}}>#{block.hash}</span>
        </div>
        {elements.length ? elements : Char.ZeroLengthSpace}
      </div>
    );
  },
  (prev, next) => prev.hash === next.hash,
);
