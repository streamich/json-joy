import * as React from 'react';
import {rule} from 'nano-theme';
import type {TabItem} from '../types';
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
  fade?: string;
  render: (tab: TabItem | undefined, state: FileTabsState, index: number) => React.ReactNode;
}

export const FileTabContent: React.FC<FileTabContentProps> = React.memo(({bg, fade, state, render}) => {
  const selected = state.selected.use();

  return (
    <div className={blockClass} style={{background: fade ? `linear-gradient(to bottom, ${bg}, ${fade})` : bg + ''}}>
      {render(selected ? selected[0] : undefined, state, selected ? selected[1] : -1)}
    </div>
  );
});
