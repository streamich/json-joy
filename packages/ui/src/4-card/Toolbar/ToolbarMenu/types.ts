import type {ContextPaneProps} from '../../ContextMenu';
import type {MenuItem} from '../../StructuralMenu/types';
import type {ToolbarExpandBtnProps} from './ToolbarExpandBtn';

export interface ToolbarMenuProps {
  menu: MenuItem;
  disabled?: boolean;
  more?: ToolbarExpandBtnProps;
  before?: React.ReactNode;
  after?: React.ReactNode;
  pane?: boolean | ContextPaneProps;
  compact?: boolean;
  /** Render the toolbar buttons one size smaller (28px instead of 32px). */
  small?: boolean;

  /**
   * Approximate horizontal pixel budget for rendered toolbar items. When the
   * estimated width of items rendered so far would exceed this budget, the
   * loop stops and the "More" button is rendered.
   */
  maxWidth?: number;

  onPopupClose?: () => void;
  onClickAway?: () => void;
  onEsc?: () => void;
}
