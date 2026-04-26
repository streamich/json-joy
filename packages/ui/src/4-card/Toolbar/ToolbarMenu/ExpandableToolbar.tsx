import * as React from 'react';
import * as sync from 'thingies/lib/sync';
import {ToolbarMenu} from '.';
import {ContextMenu, type ContextMenuProps} from '../../ContextMenu';
import {PositionAtPoint} from '../../../utils/popup/PositionAtPoint';
import {context as popupContext} from '../../Popup/context';
import {ClickAway} from '../../../utils/ClickAway';
import {ToolbarMenuProvider} from './ToolbarMenuProvider';
import {MoveToViewport} from '../../../utils/popup/MoveToViewport';
import type {ToolbarMenuProps} from './types';
import type {AnchorPoint} from '../../../utils/popup';
import type {MenuItem} from '../../StructuralMenu/types';
import {useSyncStore} from '../../../hooks/useSyncStore';

export type InlineMenuView = 'toolbar' | 'context';

export class ExpandableToolbarState {
  public readonly view = sync.val<InlineMenuView>('toolbar');
}

export interface ExpandableToolbarProps extends ToolbarMenuProps {
  state?: ExpandableToolbarState;
  expandPoint?: AnchorPoint | (() => AnchorPoint);
  disabled?: boolean;
  more?: Omit<ToolbarMenuProps['more'], 'onClick'>;
  context?: Partial<ContextMenuProps>;
  contextMenu?: MenuItem;
}

export const ExpandableToolbar: React.FC<ExpandableToolbarProps> = (props) => {
  const {state: _state, expandPoint, more, context, contextMenu = props.menu, ...rest} = props;
  const state = React.useMemo(() => _state || new ExpandableToolbarState(), [_state]);
  const view = useSyncStore(state.view);
  const popupContextValue = React.useMemo(
    () => ({
      close: () => {
        state.view.next('toolbar');
      },
    }),
    [state],
  );
  const handleContextMenuClickAway = React.useCallback(() => {
    state.view.next('toolbar');
  }, [state]);

  if (view === 'context') {
    if (!expandPoint) return null;
    return (
      <PositionAtPoint point={typeof expandPoint === 'function' ? expandPoint() : expandPoint}>
        <ClickAway onClickAway={handleContextMenuClickAway}>
          <popupContext.Provider value={popupContextValue}>
            <ToolbarMenuProvider {...rest}>
              <MoveToViewport>
                <ContextMenu
                  inset
                  showSearch
                  {...context}
                  menu={contextMenu}
                  onEsc={() => state.view.next('toolbar')}
                />
              </MoveToViewport>
            </ToolbarMenuProvider>
          </popupContext.Provider>
        </ClickAway>
      </PositionAtPoint>
    );
  }

  return (
    <ToolbarMenu
      {...rest}
      more={{
        ...more,
        onClick: expandPoint
          ? () => {
              state.view.next('context');
            }
          : undefined,
      }}
    />
  );
};
