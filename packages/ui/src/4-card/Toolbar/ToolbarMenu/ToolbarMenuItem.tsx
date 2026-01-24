import * as React from 'react';
import type {MenuItem} from '../../StructuralMenu/types';
import {ToolbarItem} from '../ToolbarItem';
import {FixedColumn} from '../../../3-list-item/FixedColumn';
import Arrow from '../../../icons/interactive/Arrow';
import {ToolbarMenuPopup} from './ToolbarMenuPopup';
import {useToolbarMenu} from './context';
import {ToolbarMenuItemTerminal} from './ToolbarMenuItemTerminal';
import {useBehaviorSubjectOpt} from '../../../hooks/useBehaviorSubject';
import {Iconista} from '../../../icons/Iconista';

export interface ToolbarMenuItemProps {
  item: MenuItem;
  small?: boolean;
  outline?: boolean;
  fill?: boolean;
  disabled?: boolean;
}

export const ToolbarMenuItem: React.FC<ToolbarMenuItemProps> = (props) => {
  const {item, disabled} = props;
  const arrow = React.useRef<HTMLDivElement | null>(null);
  const toolbar = useToolbarMenu();
  const openPanel = toolbar?.openPanel;
  const selectedPanel = useBehaviorSubjectOpt(openPanel?.selected$);
  const isTerminal = !item.children || item.children.length === 0;
  const id = item.id ?? item.name;

  if (isTerminal) {
    return <ToolbarMenuItemTerminal {...props} />;
  }

  const selected = selectedPanel === id;

  return (
    <ToolbarMenuPopup header open={selected} item={item}>
      <ToolbarItem
        width={'auto'}
        compact
        disabled={disabled}
        selected={selected}
        onMouseEnter={disabled ? void 0 : () => openPanel?.onMouseMove(id)}
        onMouseMove={disabled ? void 0 : () => openPanel?.onMouseMove(id)}
        onMouseLeave={disabled ? void 0 : openPanel?.onMouseLeave}
        onClick={disabled ? void 0 : (event) => toolbar?.execute(item, event)}
      >
        <FixedColumn right={16} style={{alignItems: 'center'}}>
          {item.icon?.() ?? <Iconista set={'elastic'} icon={'empty'} width={16} height={16} />}
          <div ref={arrow} style={{marginRight: -2, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Arrow
              direction={
                selected
                  ? (arrow.current?.getBoundingClientRect()?.top ?? 0) * 2 + 16 >= window.innerHeight
                    ? 'u'
                    : 'd'
                  : 'r'
              }
            />
          </div>
        </FixedColumn>
      </ToolbarItem>
    </ToolbarMenuPopup>
  );
};
