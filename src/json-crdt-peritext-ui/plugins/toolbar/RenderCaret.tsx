// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';
import {CaretToolbar} from './CaretToolbar';
import type {CaretViewProps} from '../../react/cursor/CaretView';
import {useToolbarPlugin} from './context';
import {PeritextEventDetailMap} from '../../events/types';

const height = 1.9;

const blockClass = rule({
  pos: 'relative',
  w: '0px',
  h: '100%',
  bg: 'black',
  va: 'bottom',
});

const overClass = rule({
  pos: 'absolute',
  b: `${height}em`,
  l: 0,
  isolation: 'isolate',
  us: 'none',
});

export interface RenderCaretProps extends CaretViewProps {
  children: React.ReactNode;
}

export const RenderCaret: React.FC<RenderCaretProps> = ({children}) => {
  const {toolbar} = useToolbarPlugin()!;

  const lastEventIsCaretPositionChange = toolbar.lastEvent?.type === 'cursor' &&
    typeof (toolbar.lastEvent?.detail as PeritextEventDetailMap['cursor']).at === 'number';

  return (
    <span className={blockClass}>
      {children}
      <span className={overClass} contentEditable={false}>
        {lastEventIsCaretPositionChange && <CaretToolbar />}
      </span>
    </span>
  );
};
