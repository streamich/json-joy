import * as React from 'react';
import {FileTabBar} from './FileTabBar';
import {FileTab} from './FileTab';
import {HslColor} from '../../../styles/color';
import {FileTabsState} from '../state';
import * as rsync from '../../../utils/rsync';
import type {TabItem} from '../types';

export interface FileTabsProps {
  tabs: TabItem[];
  state?: FileTabsState;
  bg?: HslColor | string;
  fg?: HslColor | string;
}

export const FileTabs: React.FC<FileTabsProps> = (props) => {
  const { tabs, state: _state, bg: _bg, fg: _fg} = props;
  const state = React.useMemo(() => _state ?? new FileTabsState(rsync.val(tabs)), [_state]);
  state.tabs.set(tabs);
  const bg: HslColor = React.useMemo(() => HslColor.from(_bg || '#3af')!, [_bg]);
  const fg: HslColor = React.useMemo(() => _fg
    ? HslColor.from(_fg || '#fff')!
    : bg.copy(0, bg.s * .1, (1 - bg.l) * .9), [_fg, bg]);

  return (
    <FileTabBar state={state} bg={bg} fg={fg}>
      {tabs.map((item, index) => {
        const id = item.id ?? item.name;
        return <FileTab state={state} key={id} id={id} index={index} item={item} />;
      })}
    </FileTabBar>
  );
};
