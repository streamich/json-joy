import * as React from 'react';
import {
  ExpandableToolbar,
  type ExpandableToolbarProps,
} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/ExpandableToolbar';
// import {ExpandableToolbar, type ExpandableToolbarProps} from './ExpandableToolbar';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup';

export interface AutoExpandableToolbarProps extends ExpandableToolbarProps {
  menu: MenuItem;
  disabled?: boolean;
  onPopupClose?: () => void;
}

export const AutoExpandableToolbar: React.FC<AutoExpandableToolbarProps> = ({
  menu,
  disabled,
  onPopupClose,
  ...rest
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const getExpandPoint = React.useCallback((): AnchorPoint => {
    const el = ref.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const doLeanLeft = rect.x > 360;
      return doLeanLeft
        ? {x: rect.x + rect.width - 32, y: rect.y, dx: -1, dy: 0}
        : {x: rect.x + rect.width + 8, y: rect.y, dx: 1, dy: 0};
    }
    return {x: 32, y: 32, dx: 1, dy: 1};
  }, []);

  return (
    <div ref={ref}>
      <ExpandableToolbar
        {...rest}
        pane={{
          ...(typeof rest.pane === 'object' ? rest.pane : {}),
          compact: true,
        } as any}
        compact
        menu={menu}
        expandPoint={getExpandPoint}
        disabled={disabled}
        onPopupClose={onPopupClose}
        more={{
          small: true,
          tooltip: {
            renderTooltip: () => 'More',
            nowrap: true,
            shortcut: 'Ctrl + /',
          },
        }}
      />
    </div>
  );
};
