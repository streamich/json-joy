import * as React from 'react';
import {rule} from 'nano-theme';
import {usePeritext} from './context';
import {LeafBlockView} from './LeafBlockView';
import {LeafBlock} from '../../json-crdt-extensions/peritext/block/LeafBlock';
import {Block} from '../../json-crdt-extensions/peritext/block/Block';

const blockClass = rule({
  pos: 'relative',
  pd: '32px',
  out: 0,
  'caret-color': 'transparent',
  '::selection': {
    // bgc: 'transparent',
    bgc: 'rgba(0,0,0,.1)',
  },
});

const blockDebugClass = rule({
  'caret-color': 'red',
  '::selection': {
    bgc: 'red',
  },
  '& .jj-leaf-block': {
    out: '1px dotted green',
  },
  '& .jsonjoy-text': {
    pointerEvents: 'none',
    out: '1px dotted blue',
  },
});

export interface BlockViewProps {
  hash: number;
  block: Block;
  el?: (element: HTMLElement | null) => void;
}

export const BlockView: React.FC<BlockViewProps> = React.memo(
  ({block, el}) => {
    const {debug} = usePeritext();

    const children = block.children;
    const length = children.length;
    const elements: React.ReactNode[] = [];
    for (let i = 0; i < length; i++) {
      const child = children[i];
      if (child instanceof LeafBlock) {
        elements.push(<LeafBlockView key={child.key()} hash={child.hash} block={child} />);
      } else if (child instanceof Block) {
        elements.push(<BlockView key={child.key()} hash={child.hash} block={child} />);
      }
    }

    const className = blockClass + (debug ? blockDebugClass : '');

    return (
      <div ref={(element) => el?.(element)} className={className}>
        <div contentEditable={false} style={{margin: '16px 0 8px'}}>
          <span style={{fontSize: '0.7em', background: 'rgba(0,0,0,.1)', display: 'inline-block'}}>#{block.hash}</span>
        </div>
        {elements}
      </div>
    );
  },
  (prev, next) => prev.hash === next.hash,
);
