import * as React from 'react';
import {ExpandableToolbar, type ExpandableToolbarProps} from './ExpandableToolbar';
import type {MenuItem} from '../../StructuralMenu/types';
import type {AnchorPoint} from '../../../utils/popup';

export interface CaretToolbarProps extends ExpandableToolbarProps {
  menu: MenuItem;
  disabled?: boolean;
  onPopupClose?: () => void;
}

export const CaretToolbar: React.FC<CaretToolbarProps> = ({menu, disabled, onPopupClose, ...rest}) => {
  const expandPoint = React.useRef<AnchorPoint>({x: 32, y: 32, dx: 1, dy: 1});
  const ref = React.useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect) return;
    expandPoint.current.dx = -1;
    expandPoint.current.x = rect.right + 4;
    expandPoint.current.y = rect.y - 16;
  }, []);

  return (
    <span ref={ref}>
      <ExpandableToolbar
        {...rest}
        menu={menu}
        expandPoint={expandPoint.current}
        disabled={disabled}
        onPopupClose={onPopupClose}
      />
    </span>
  );
};
