import * as React from 'react';
import {useTheme} from 'nano-theme';
import {FileTabBar} from './FileTabBar';
import {FileTab} from './FileTab';
import {HslColor} from '../../../styles/color';
import {FileTabsState} from '../state';
import * as rsync from '../../../utils/rsync';
import {FileTabContent, type FileTabContentProps} from './FileTabContent';
import {FileTabTooltip} from './FileTabTooltip';
import type {TabItem} from '../types';
import {isTouch} from '../../../utils/environment';

export interface FileTabsProps {
  /** Initial tabs to display, if `state` not provided. */
  tabs?: TabItem[];
  render?: FileTabContentProps['render'];
  state?: FileTabsState;
  onState?: (state: FileTabsState) => void;
  bg?: HslColor | string;
  fg?: HslColor | string;
  fade?: string;
  before?: React.ReactNode;
  after?: React.ReactNode;
  right?: React.ReactNode;
  addNewTab?: (() => TabItem | undefined) | undefined;
  barStyle?: React.CSSProperties;
}

export const FileTabs: React.FC<FileTabsProps> = (props) => {
  const {tabs: _tabs, state: _state, bg: _bg, fg: _fg, fade, render, addNewTab, before, after, right, barStyle} = props;
  const state = React.useMemo(() => {
    if (_state) return _state;
    const state = new FileTabsState(rsync.val(_tabs ?? []));
    state.onNewTab = addNewTab;
    return state;
  }, [_state, _tabs, addNewTab]);
  React.useEffect(() => {
    if (!state) return;
    return () => state.dispose();
  }, [state]);
  React.useEffect(() => {
    if (props.onState) props.onState(state);
  }, [state, props.onState]);
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
  const theme = useTheme();
  const bg: HslColor = React.useMemo(
    () => HslColor.from(_bg || (theme.isLight ? '#3af' : '#1c4a6e'))!,
    [_bg, theme.isLight],
  );
  const fg: HslColor = React.useMemo(() => {
    if (_fg) return HslColor.from(_fg)!;
    if (!theme.isLight) {
      const themeBg = HslColor.from(theme.bg);
      if (themeBg) return themeBg;
    }
    return bg.copy(0, bg.s * 0.1, (1 - bg.l) * 0.9);
  }, [_fg, bg, theme.isLight, theme.bg]);

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
        style={barStyle}
        overlay={isTouch ? void 0 : <FileTabTooltip state={state} />}
      />
      {!!render && <FileTabContent state={state} bg={fg} fade={fade} render={render} />}
    </>
  );
};
