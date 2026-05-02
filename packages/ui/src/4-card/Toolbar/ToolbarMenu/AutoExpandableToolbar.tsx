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

export interface AutoExpandableToolbarProps extends ToolbarMenuProps {
  context?: Partial<ContextMenuProps>;
  contextMenu?: MenuItem;
}

export const AutoExpandableToolbar: React.FC<AutoExpandableToolbarProps> = (props) => {
  const {more, context, contextMenu = props.menu, ...rest} = props;
  const [point, setPoint] = React.useState<AnchorPoint | null>(null);

  const close = React.useCallback(() => setPoint(null), []);

  const handleMoreClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPoint({x: rect.left, y: rect.bottom + 4, dx: 1, dy: 1});
  }, []);

  const popupContextValue = React.useMemo(() => ({close}), [close]);

  return (
    <>
      <ToolbarMenu {...rest} more={{...more, onClick: handleMoreClick}} />
      {point && (
        <PositionAtPoint point={point}>
          <ClickAway onClickAway={close}>
            <popupContext.Provider value={popupContextValue}>
              <ToolbarMenuProvider {...rest} more={more}>
                <MoveToViewport>
                  <ContextMenu inset showSearch {...context} menu={contextMenu} onEsc={close} />
                </MoveToViewport>
              </ToolbarMenuProvider>
            </popupContext.Provider>
          </ClickAway>
        </PositionAtPoint>
      )}
    </>
  );
};
