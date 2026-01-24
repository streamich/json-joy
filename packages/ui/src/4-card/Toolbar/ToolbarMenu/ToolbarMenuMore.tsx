import * as React from 'react';
import {useT} from 'use-t';
import type {MenuItem} from '../../StructuralMenu/types';
import {ToolbarItem} from '../ToolbarItem';
import {ToolbarMenuPopup} from './ToolbarMenuPopup';
import {useToolbarMenu} from './context';
import {Iconista} from '../../../icons/Iconista';
import {useBehaviorSubjectOpt} from '../../../hooks/useBehaviorSubject';

export interface ToolbarMenuMoreProps {
  item: MenuItem;
  disabled?: boolean;
}

export const ToolbarMenuMore: React.FC<ToolbarMenuMoreProps> = ({item, disabled}) => {
  const [t] = useT();
  const openPanel = useToolbarMenu()?.openPanel;
  const selected_ = useBehaviorSubjectOpt(openPanel?.selected$);

  const id = item.id ?? item.name;
  const selected = selected_ === id;

  return (
    <ToolbarMenuPopup open={selected_ === id} item={item}>
      <div style={{height: 32, display: 'flex', alignItems: 'center'}}>
        <ToolbarItem
          fill
          narrow
          skewed={false}
          height={28}
          disabled={disabled}
          selected={selected}
          children={<Iconista width={16} height={16} set={'tabler'} icon={'dots-vertical'} style={{opacity: 0.5}} />}
          onMouseEnter={disabled ? void 0 : () => openPanel?.onMouseMove(id)}
          onMouseMove={disabled ? void 0 : () => openPanel?.onMouseMove(id)}
          onMouseLeave={disabled ? void 0 : openPanel?.onMouseLeave}
          onClick={disabled ? void 0 : () => openPanel?.onClick(id)}
          tooltip={{
            renderTooltip: item.name ? () => t(item.name) : void 0,
          }}
        />
      </div>
    </ToolbarMenuPopup>
  );
};
