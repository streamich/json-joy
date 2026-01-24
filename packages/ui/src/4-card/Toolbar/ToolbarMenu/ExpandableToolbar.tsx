import * as React from 'react';
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

export type InlineMenuView = 'toolbar' | 'context';

export interface ExpandableToolbarProps extends ToolbarMenuProps {
  expandPoint?: AnchorPoint | (() => AnchorPoint);
  disabled?: boolean;
  more?: Omit<ToolbarMenuProps['more'], 'onClick'>;
  context?: ContextMenuProps;
  contextMenu?: MenuItem;
}

export const ExpandableToolbar: React.FC<ExpandableToolbarProps> = (props) => {
  const {expandPoint, more, context, contextMenu = props.menu, ...rest} = props;
  const [view, setView] = React.useState<InlineMenuView>('toolbar');
  const popupContextValue = React.useMemo(
    () => ({
      close: () => {
        setView('toolbar');
      },
    }),
    [],
  );
  const handleContextMenuClickAway = React.useCallback(() => {
    setView('toolbar');
  }, []);

  if (view === 'context') {
    if (!expandPoint) return null;
    return (
      <PositionAtPoint point={typeof expandPoint === 'function' ? expandPoint() : expandPoint}>
        <ClickAway onClickAway={handleContextMenuClickAway}>
          <popupContext.Provider value={popupContextValue}>
            <ToolbarMenuProvider {...rest}>
              <MoveToViewport>
                <ContextMenu inset showSearch {...context} menu={contextMenu} onEsc={() => setView('toolbar')} />
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
              setView('context');
            }
          : undefined,
      }}
    />
  );
};
