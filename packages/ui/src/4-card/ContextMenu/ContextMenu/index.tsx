import * as React from 'react';
import {ContextMenuPane, type ContextMenuPaneProps} from './ContextMenuPane';
import {context} from './context';
import {ContextMenuState} from './state';
import {useBehaviorSubject} from '../../../hooks/useBehaviorSubject';
import {usePopup} from '../../Popup/context';

export {ContextMenuState};

export interface ContextMenuProps extends ContextMenuPaneProps {}

export const ContextMenu: React.FC<ContextMenuProps> = ({...props}) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: props spread creates new object each render
  const state = React.useMemo(() => ContextMenuState.create(props), [props]);

  state.props = props;

  return <StatefulContextMenu state={state} />;
};

export interface StatefulContextMenuProps {
  state: ContextMenuState;
}

export const StatefulContextMenu: React.FC<StatefulContextMenuProps> = ({state}) => {
  const popup = usePopup();
  state.onclose = popup?.close;
  const path = useBehaviorSubject(state.path$);
  const currentMenu = useBehaviorSubject(state.menu$);

  const id = currentMenu.id ?? currentMenu.name;

  return (
    <context.Provider value={state}>
      <ContextMenuPane key={id} {...state.props} path={path} menu={currentMenu} />
    </context.Provider>
  );
};
