import * as React from 'react';
import {rule} from 'nano-theme';
import {LeafBlock} from '../../json-crdt-extensions/peritext/block/LeafBlock';
import {InlineView} from './inline/InlineView';
import {CaretView} from './inline/CaretView';

const blockClass = rule({
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
});

export interface Props {
  hash: number;
  block: LeafBlock;
}

export const LeafBlockView: React.FC<Props> = React.memo(
  ({block}) => {
    const elements: React.ReactNode[] = [];
    for (const inline of block.texts()) {
      const attributes = inline.attr();
      const isCursor =
        // attributes[0] === 1 && inline.start.anchor === inline.end.anchor && inline.start.pos() === inline.end.pos();
        false && inline.start.anchor === inline.end.anchor && inline.start.pos() === inline.end.pos();
      if (isCursor) {
        elements.push(<CaretView key={inline.key()} />);
      } else {
        elements.push(<InlineView key={inline.key()} inline={inline} />);
      }
    }

    return (
      <div className={'jj-leaf-block' + blockClass}>
        <span style={{fontSize: '0.7em', background: 'rgba(0,0,0,.1)'}}>#{block.hash}</span>
        {elements.length ? elements : 'EMPTY'}
      </div>
    );
  },
  (prev, next) => prev.hash === next.hash,
);
