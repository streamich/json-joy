import * as React from 'react';
import {rule} from 'nano-theme';
import {LeafBlock} from '../../json-crdt-extensions/peritext/block/LeafBlock';
import {InlineView} from './InlineView';
import {Char} from '../constants';

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
    for (const inline of block.texts())
      elements.push(<InlineView key={inline.key()} inline={inline} />);

    return (
      <div className={blockClass}>
        <div contentEditable={false} style={{margin: '16px 0 8px'}}>
            <span style={{fontSize: '0.7em', background: 'rgba(0,0,0,.1)', display: 'inline-block'}}>#{block.hash}</span>
        </div>
        {elements.length ? elements : Char.ZeroLengthSpace}
      </div>
    );
  },
  (prev, next) => prev.hash === next.hash,
);
