import * as React from 'react';
import {useBehaviorSubject} from '../../../hooks/useBehaviorSubject';
import {isMobile, isTouch} from '../../../utils/environment';
import {usePopup} from '../../Popup/context';
import {ArgsPane} from '../ArgsPane';
import {ContextMenuPane, type ContextMenuPaneProps} from './ContextMenuPane';
import {context} from './context';
import {ContextMenuState} from './state';

export {ContextMenuState};

export interface ContextMenuProps extends ContextMenuPaneProps {}

const doUseMobileSheet = isTouch || isMobile;

const importContextMenuMobile = () => import('../ContextMenuMobile');
const ContextMenuMobile = React.lazy(async () => ({
  default: (await importContextMenuMobile()).ContextMenuMobile,
}));
if (doUseMobileSheet) importContextMenuMobile().catch(() => {});

export const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  const root = (props.depth ?? 0) === 0;
  if (root && doUseMobileSheet)
    return (
      <React.Suspense fallback={null}>
        <ContextMenuMobile {...props} />
      </React.Suspense>
    );
  return <DesktopContextMenu {...props} />;
};

const DesktopContextMenu: React.FC<ContextMenuProps> = ({...props}) => {
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
  state.onclose = state.props?.onClose ?? popup?.close;
  const path = useBehaviorSubject(state.path$);
  const currentMenu = useBehaviorSubject(state.menu$);
  const argsItem = state.argsItem.use();

  const id = currentMenu.id ?? currentMenu.name;
  const minWidth = currentMenu.minWidth ?? state.minWidth ?? 220;

  if (argsItem) {
    const params = argsItem.params;
    if (params && params.length) {
      return (
        <context.Provider value={state}>
          <ArgsPane
            item={argsItem}
            params={argsItem.params ?? []}
            minWidth={minWidth}
            onCancel={() => state.argsItem.next(null)}
            onSubmit={(list, map) => {
              argsItem.onSubmit?.(list, map);
              state.onclose?.();
            }}
          />
        </context.Provider>
      );
    }
  }

  return (
    <context.Provider value={state}>
      <ContextMenuPane key={id} {...state.props} path={path} menu={currentMenu} />
    </context.Provider>
  );
};
