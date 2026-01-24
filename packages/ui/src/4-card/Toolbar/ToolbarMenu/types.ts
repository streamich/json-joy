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
  onPopupClose?: () => void;
  onClickAway?: () => void;
  onEsc?: () => void;
}
