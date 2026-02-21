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
  const expandPoint = React.useRef<AnchorPoint>({x: 32, y: 32, dx: 1, dy: 1});

  return (
    <div
      ref={(el: HTMLElement | null) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (!rect) return;
        expandPoint.current.dx = 1;
        expandPoint.current.dy = 1;
        expandPoint.current.x = rect.x - 100;
        expandPoint.current.y = rect.y - 48;
      }}
    >
      <ExpandableToolbar
        {...rest}
        menu={menu}
        expandPoint={() => expandPoint.current}
        disabled={disabled}
        onPopupClose={onPopupClose}
      />
    </div>
  );
};
