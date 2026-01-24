import * as React from 'react';
import {ToolbarPane} from '../ToolbarPane';
import {ExpandChildren} from './ExpandChildren';
import {ToolbarSep} from '../ToolbarSep';
import {ExpandSubChildren} from './ExpandSubChildren';
import {ToolbarMenuItem} from './ToolbarMenuItem';
import {context} from './context';
import {ToolbarExpandBtn} from './ToolbarExpandBtn';
import type {ToolbarMenuProps} from './types';
import {context as popupContext} from '../../Popup/context';
import {ClickAway} from '../../../utils/ClickAway';
import {useBehaviorSubject} from '../../../hooks/useBehaviorSubject';
import {ToolbarMenuState} from './state';

export {ToolbarMenuState};

export const ToolbarMenu: React.FC<ToolbarMenuProps> = (props) => {
  const _menu = props.menu;
  const state = React.useMemo(() => new ToolbarMenuState(props), [props]);

  return <StatefulToolbarMenu {...props} state={state} />;
};

export interface StatefulToolbarMenuProps extends ToolbarMenuProps {
  state: ToolbarMenuState;
}

export const StatefulToolbarMenu: React.FC<StatefulToolbarMenuProps> = (props) => {
  const {state, menu, disabled, more, before, after, pane = true, onPopupClose, onClickAway} = props;
  state.props = props;
  const openPanel = state.openPanel;
  const selected = useBehaviorSubject(openPanel.selected$);
  const popupContextValue = React.useMemo(
    () => ({
      close: () => {
        openPanel.onClick('');
        onPopupClose?.();
      },
    }),
    [onPopupClose, openPanel.onClick],
  );
  const handleClickAway = React.useCallback(() => {
    if (onClickAway && !selected) onClickAway();
    openPanel.onClick('');
  }, [onClickAway, selected, openPanel.onClick]);
  React.useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        event.preventDefault();
        const success = openPanel.deselect();
        if (!success) state.props.onEsc?.();
      }
    };
    document.addEventListener('keydown', onKeydown);
    return () => {
      document.removeEventListener('keydown', onKeydown);
    };
  }, [openPanel, state.props.onEsc]);

  const nodes: React.ReactNode[] = [];
  const children = menu.children;
  const length = children?.length ?? 0;
  const max = menu?.maxToolbarItems ?? 1e3;
  let cnt = 0;

  for (let i = 0; i < length && cnt < max; i++) {
    const child = children![i];
    const key = child.id || child.name || i;
    if (child.sep || child.sepBefore) {
      nodes.push(<ToolbarSep key={key + '-sep'} line />);
      if (!child.sepBefore) continue;
    }
    if (child.expand && !child?.children?.[0]?.iconBig) {
      cnt++;
      nodes.push(<ExpandChildren key={key} item={child} disabled={disabled} />);
    } else if (typeof child.expandChild === 'number') {
      cnt++;
      const subChild = child.children?.[child.expandChild];
      if (!subChild) continue;
      nodes.push(<ExpandSubChildren key={key} item={subChild} parent={child} disabled={disabled} />);
    } else {
      cnt++;
      nodes.push(<ToolbarMenuItem key={key} item={child} disabled={disabled} />);
    }
  }

  const showMore = length > max && !!more;

  let element: React.ReactNode = (
    <popupContext.Provider value={popupContextValue}>
      <context.Provider value={state}>
        {before}
        {nodes}
        {after}
        {showMore && <ToolbarSep line />}
        {showMore && <ToolbarExpandBtn {...more} disabled={disabled} />}
      </context.Provider>
    </popupContext.Provider>
  );

  if (pane) {
    element = <ToolbarPane {...(typeof pane === 'object' ? pane : {})}>{element}</ToolbarPane>;
  }

  return <ClickAway onClickAway={handleClickAway}>{element}</ClickAway>;
};
