import * as React from 'react';
import {rule} from 'nano-theme';
import {usePeritext} from '../context';
import {BlockView} from './BlockView';
import {LeafBlockView} from './LeafBlockView';
import {LeafBlock} from '../../../json-crdt-extensions/peritext/block/LeafBlock';
import {Block} from '../../../json-crdt-extensions/peritext/block/Block';

const blockClass = rule({
  pos: 'relative',
  pad: '32px',
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
  '& .jj-text': {
    pointerEvents: 'none',
    out: '1px dotted blue',
  },
});

export interface Props {
  ref: React.Ref<HTMLElement>;
}

export const RootBlockView = React.forwardRef<HTMLElement, Props>((props, ref) => {
  const {peritext, debug} = usePeritext();

  const root = peritext.blocks.root;
  const children = root.children;
  const length = children.length;
  const elements: React.ReactNode[] = [];
  for (let i = 0; i < length; i++) {
    const block = children[i];
    if (block instanceof LeafBlock) {
      elements.push(<LeafBlockView key={block.key()} hash={block.hash} block={block} />);
    } else if (block instanceof Block) {
      elements.push(<BlockView key={block.key()} hash={block.hash} block={block} />);
    }
  }

  const className = blockClass + (debug ? blockDebugClass : '');

  return (
    <div ref={ref as any} className={className}>
      {elements}
    </div>
  );
});
