import * as React from 'react';
import {FileTabBar} from './FileTabBar';
import {FileTab} from './FileTab';
import {HslColor} from '../../../styles/color';
import {FileTabsState} from '../state';
import * as rsync from '../../../utils/rsync';
import {FileTabContent, FileTabContentProps} from './FileTabContent';
import {FileTabTooltip} from './FileTabTooltip';
import type {TabItem} from '../types';

export interface FileTabsProps {
  tabs: TabItem[];
  render?: FileTabContentProps['render'];
  state?: FileTabsState;
  bg?: HslColor | string;
  fg?: HslColor | string;
  before?: React.ReactNode;
  after?: React.ReactNode;
  right?: React.ReactNode;
  addNewTab?: (() => TabItem | undefined) | undefined;
}

export const FileTabs: React.FC<FileTabsProps> = (props) => {
  const { tabs: _tabs, state: _state, bg: _bg, fg: _fg, render, addNewTab, before, after, right } = props;
  const state = React.useMemo(() => {
    return _state ?? new FileTabsState(rsync.val(_tabs));
  }, [_state]);
  React.useEffect(() => {
    state.addNewTab = addNewTab;
    return () => {
      if (state.addNewTab === addNewTab) state.addNewTab = void 0;
    };
  }, [state, addNewTab]);
  React.useEffect(() => {
    if (_state) return;
    return () => state.dispose();
  }, [state, _state]);
  const tabs = state.tabs.use();
  const exitingTabs = state.exitingTabs.use();

  const tabElements: React.ReactElement[] = [];
  {
    const tLen = tabs.length;
    const eLen = exitingTabs.length;
    let ti = 0; // pointer into tabs (real index)
    let ei = 0; // pointer into exitingTabs
    while (ti < tLen || ei < eLen) {
      while (ei < eLen && exitingTabs[ei].insertAt <= ti) {
        const {tab} = exitingTabs[ei];
        const id = tab.id ?? tab.name;
        tabElements.push(<FileTab key={id} state={state} id={id} index={-1} item={tab} isExiting />);
        ei++;
      }
      if (ti < tLen) {
        const item = tabs[ti];
        const id = item.id ?? item.name;
        tabElements.push(<FileTab key={id} state={state} id={id} index={ti} item={item} />);
        ti++;
      }
    }
  }
  const bg: HslColor = React.useMemo(() => HslColor.from(_bg || '#3af')!, [_bg]);
  const fg: HslColor = React.useMemo(() => _fg
    ? HslColor.from(_fg || '#fff')!
    : bg.copy(0, bg.s * .1, (1 - bg.l) * .9), [_fg, bg]);


  return (
    <>
      <FileTabBar
        state={state}
        bg={bg}
        fg={fg}
        tabs={tabElements}
        before={before}
        after={after}
        right={right}
        overlay={<FileTabTooltip state={state} />}
      />
      {!!render && <FileTabContent state={state} bg={fg} render={render} />}
    </>
  );
};
