import * as React from 'react';
import {rule} from 'nano-theme';
import {TabItem} from '../types';
import type {HslColor} from '../../../styles/color';
import type {FileTabsState} from '../state';

const blockClass = rule({
  pd: 0,
  w: '100%',
  bxz: 'border-box',
  bdrad: '4px',
});

export interface FileTabContentProps {
  state: FileTabsState;
  bg: HslColor;
  render: (tab: TabItem, state: FileTabsState, index: number) => React.ReactNode;
}

export const FileTabContent: React.FC<FileTabContentProps> = React.memo(({bg, state, render}) => {
  const selected = state.selected.use();

  if (!selected) return null;

  return (
    <div className={blockClass} style={{background: bg + ''}}>
      {render(selected[0], state, selected[1])}
    </div>
  );
});
