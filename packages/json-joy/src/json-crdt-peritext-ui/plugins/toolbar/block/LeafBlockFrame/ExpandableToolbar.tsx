import * as React from 'react';
import {ToolbarMenu} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu';
import {ContextMenu, type ContextMenuProps} from 'nice-ui/lib/4-card/ContextMenu';
import {PositionAtPoint} from 'nice-ui/lib/utils/popup/PositionAtPoint';
import {context as popupContext} from 'nice-ui/lib/4-card/Popup/context';
import {ClickAway} from 'nice-ui/lib/utils/ClickAway';
import {ToolbarMenuProvider} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu/ToolbarMenuProvider';
import {MoveToViewport} from 'nice-ui/lib/utils/popup/MoveToViewport';
import type {ToolbarMenuProps} from 'nice-ui/lib/4-card/Toolbar/ToolbarMenu/types';
import type {AnchorPoint} from 'nice-ui/lib/utils/popup';

export type InlineMenuView = 'toolbar' | 'context';

export interface ExpandableToolbarProps extends ToolbarMenuProps {
  expandPoint?: AnchorPoint | (() => AnchorPoint);
  disabled?: boolean;
  more?: Omit<ToolbarMenuProps['more'], 'onClick'>;
  context?: ContextMenuProps;
}

export const ExpandableToolbar: React.FC<ExpandableToolbarProps> = (props) => {
  const {expandPoint, more, context, ...rest} = props;
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
                <ContextMenu inset showSearch {...context} menu={rest.menu} onEsc={() => setView('toolbar')} />
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
