import * as React from 'react';
import {FileTabBar} from './FileTabBar';
import {FileTab} from './FileTab';
import {HslColor} from '../../../styles/color';
import {FileTabsState} from '../state';
import * as rsync from '../../../utils/rsync';
import {FileTabContent, FileTabContentProps} from './FileTabContent';
import type {TabItem} from '../types';

export interface FileTabsProps {
  tabs: TabItem[];
  render?: FileTabContentProps['render'];
  state?: FileTabsState;
  bg?: HslColor | string;
  fg?: HslColor | string;
}

export const FileTabs: React.FC<FileTabsProps> = (props) => {
  const { tabs: _tabs, state: _state, bg: _bg, fg: _fg, render} = props;
  const state = React.useMemo(() => _state ?? new FileTabsState(rsync.val(_tabs)), [_state]);
  const tabs = state.tabs.use();
  const bg: HslColor = React.useMemo(() => HslColor.from(_bg || '#3af')!, [_bg]);
  const fg: HslColor = React.useMemo(() => _fg
    ? HslColor.from(_fg || '#fff')!
    : bg.copy(0, bg.s * .1, (1 - bg.l) * .9), [_fg, bg]);


  return (
    <>
      <FileTabBar state={state} bg={bg} fg={fg}>
        {tabs.map((item, index) => {
          const id = item.id ?? item.name;
          return <FileTab key={id} state={state} id={id} index={index} item={item} />;
        })}
      </FileTabBar>
      {!!render && <FileTabContent state={state} bg={fg} render={render} />}
    </>
  );
};
