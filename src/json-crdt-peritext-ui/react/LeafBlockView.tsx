import * as React from 'react';
import {rule} from 'nano-theme';
import {LeafBlock} from '../../json-crdt-extensions/peritext/block/LeafBlock';
import {InlineView} from './InlineView';
import {CaretView} from './selection/CaretView';
import {AnchorView} from './selection/AnchorView';

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
      const keyBase = inline.key();
      const cursorStart = inline.cursorStart();
      if (cursorStart) {
        const key = keyBase + 'a';
        elements.push(cursorStart.isStartFocused() ? <CaretView key={key} /> : <AnchorView key={key} />);
      }
      elements.push(<InlineView key={keyBase} inline={inline} />);
      const cursorEnd = inline.cursorEnd();
      if (cursorEnd) {
        const key = keyBase + 'b';
        elements.push(cursorEnd.isEndFocused() ? <CaretView key={key} /> : <AnchorView key={key} />);
      }
    }

    return (
      <div className={'jj-leaf-block' + blockClass}>
        <div contentEditable={false} style={{margin: '16px 0 8px'}}>
            <span style={{fontSize: '0.7em', background: 'rgba(0,0,0,.1)', display: 'inline-block'}}>#{block.hash}</span>
        </div>
        {elements.length ? elements : 'EMPTY'}
      </div>
    );
  },
  (prev, next) => prev.hash === next.hash,
);
