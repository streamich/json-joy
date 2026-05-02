import * as React from 'react';
import {ToolbarPane} from '../ToolbarPane';
import {ExpandChildren} from './ExpandChildren';
import {ToolbarSep} from '../ToolbarSep';
import {ExpandSubChildren} from './ExpandSubChildren';
import {ToolbarMenuItem} from './ToolbarMenuItem';
import {context} from './context';
import {ToolbarExpandBtn} from './ToolbarExpandBtn';
import {context as popupContext} from '../../Popup/context';
import {ClickAway} from '../../../utils/ClickAway';
import {useBehaviorSubject} from '../../../hooks/useBehaviorSubject';
import {ToolbarMenuState} from './state';
import type {ToolbarMenuProps} from './types';

export {ToolbarMenuState};

export const ToolbarMenu: React.FC<ToolbarMenuProps> = (props) => {
  const reactId = React.useId();
  const state = React.useMemo(() => new ToolbarMenuState(props, reactId), [props, reactId]);

  return <StatefulToolbarMenu {...props} state={state} />;
};

export interface StatefulToolbarMenuProps extends ToolbarMenuProps {
  state: ToolbarMenuState;
  compact?: boolean;
}

export const StatefulToolbarMenu: React.FC<StatefulToolbarMenuProps> = (props) => {
  const {state, menu, disabled, more, before, after, pane = true, onPopupClose, onClickAway, compact, maxWidth} = props;
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

  const itemWidth = compact ? 28 : 32;
  const sepLineWidth = compact ? 6 : 10;
  const moreWidth = more?.small === false ? 64 : itemWidth;
  const widthBudget = maxWidth ?? Number.POSITIVE_INFINITY;
  let usedWidth = 0;
  let stoppedByWidth = false;
  let lastWasSep = true;

  for (let i = 0; i < length && cnt < max; i++) {
    const child = children![i];
    const key = child.id || child.name || i;

    const wantsSep = !!(child.sep || child.sepBefore);
    const isSepOnly = !!child.sep && !child.sepBefore;
    const sepRendered = wantsSep && !lastWasSep;

    let childWidth = sepRendered ? sepLineWidth : 0;
    if (!isSepOnly) {
      if (child.expand && !child?.children?.[0]?.iconBig) {
        const subLen = child.children?.length ?? 0;
        const subMax = child.expand ?? 5;
        const subItems = Math.min(subLen, subMax) + (subLen > subMax ? 1 : 0);
        childWidth += subItems * itemWidth;
      } else if (typeof child.expandChild === 'number') {
        const subChild = child.children?.[child.expandChild];
        if (subChild) {
          const subChildren = child.preview ?? subChild.preview ?? subChild.children;
          const subLen = subChildren?.length ?? 0;
          const subMax = Math.min(subChild.expand ?? 4, 4);
          const subItems = Math.min(subLen, subMax) + 1;
          childWidth += subItems * itemWidth;
        }
      } else {
        childWidth += itemWidth;
      }
    }

    const remaining = length - i - 1;
    const reserveMore = remaining > 0 ? moreWidth + sepLineWidth : 0;
    if (usedWidth + childWidth + reserveMore > widthBudget) {
      stoppedByWidth = true;
      break;
    }
    usedWidth += childWidth;

    if (sepRendered) {
      nodes.push(<ToolbarSep key={key + '-sep'} line compact={compact} />);
      lastWasSep = true;
    }
    if (isSepOnly) continue;
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
    lastWasSep = false;
  }

  if (lastWasSep && nodes.length > 0) nodes.pop();

  const showMore = (length > max && !!more) || (stoppedByWidth && !!more);

  let element: React.ReactNode = (
    <popupContext.Provider value={popupContextValue}>
      <context.Provider value={state}>
        {before}
        {nodes}
        {after}
        {showMore && <ToolbarSep line compact={compact} />}
        {showMore && <ToolbarExpandBtn {...more} disabled={disabled} />}
      </context.Provider>
    </popupContext.Provider>
  );

  if (pane) {
    element = <ToolbarPane {...(typeof pane === 'object' ? pane : {})}>{element}</ToolbarPane>;
  }

  return <ClickAway onClickAway={handleClickAway}>{element}</ClickAway>;
};
