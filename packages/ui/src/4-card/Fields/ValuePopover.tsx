import * as React from 'react';
import {ContextPane} from '../ContextMenu/ContextPane';

export interface ValuePopoverProps {
  /**
   * Minimum width in px — typically the value column width, so the popover
   * lines up under the cell (Notion behavior). The body can grow past it.
   */
  minWidth?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * Shared chrome for the {@link ValueCell} reveal popover: a rounded, lightly
 * elevated pane sized to (at least) the value column width, hosting the kind's
 * `editor()` body ({@link FieldEditor}). Opening, anchoring, and dismissal are
 * owned by the trigger in `ValueCell`; this component is only the surface.
 */
export const ValuePopover: React.FC<ValuePopoverProps> = ({minWidth, style, children}) => (
  <ContextPane style={{minWidth, padding: '8px 0', ...style}}>{children}</ContextPane>
);
