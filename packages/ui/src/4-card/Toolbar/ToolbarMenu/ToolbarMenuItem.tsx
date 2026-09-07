import * as React from 'react';
import {FixedColumn} from '../../../3-list-item/FixedColumn';
import {useBehaviorSubjectOpt} from '../../../hooks/useBehaviorSubject';
import {useSyncStoreOpt} from '../../../hooks/useSyncStore';
import {Iconista} from '../../../icons/Iconista';
import Arrow from '../../../icons/interactive/Arrow';
import type {MenuItem} from '../../StructuralMenu/types';
import {ToolbarItem} from '../ToolbarItem';
import {useToolbarMenu} from './context';
import {ToolbarMenuItemTerminal} from './ToolbarMenuItemTerminal';
import {ToolbarMenuPopup} from './ToolbarMenuPopup';

export interface ToolbarMenuItemProps {
  item: MenuItem;
  small?: boolean;
  outline?: boolean;
  fill?: boolean;
  disabled?: boolean;
}

export const ToolbarMenuItem: React.FC<ToolbarMenuItemProps> = (props) => {
  const {item, disabled, small} = props;
  const arrow = React.useRef<HTMLDivElement | null>(null);
  const toolbar = useToolbarMenu();
  const openPanel = toolbar?.openPanel;
  useBehaviorSubjectOpt(openPanel?.selected$);
  const active = !!useSyncStoreOpt(item.active);
  const isTerminal = !item.pane && !item.raw && (!item.children || item.children.length === 0);
  const id = item.id ?? item.name;

  if (isTerminal) {
    return <ToolbarMenuItemTerminal {...props} />;
  }

  const selected = openPanel?.isSelected(id) ?? false;
  const icon = item.icon?.() ?? <Iconista set={'elastic'} icon={'empty'} width={16} height={16} />;
  const split = item.split;

  if (split) {
    return (
      <>
        <ToolbarItem
          compact
          small={small}
          disabled={disabled}
          selected={active}
          bdradR={2}
          onClick={disabled ? void 0 : item.onSelect}
          tooltip={{
            shortcut: item.keys?.join(''),
            renderTooltip: () => item.name ?? item.id ?? '',
          }}
        >
          {icon}
        </ToolbarItem>
        <div style={{width: 1}} />
        <ToolbarMenuPopup header={!item.noHeader} open={selected} item={item}>
          <ToolbarItem
            narrow
            compact
            small={small}
            disabled={disabled}
            selected={selected}
            bdradL={2}
            onMouseEnter={disabled ? void 0 : () => openPanel?.onMouseMove(id)}
            onMouseMove={disabled ? void 0 : () => openPanel?.onMouseMove(id)}
            onMouseLeave={disabled ? void 0 : openPanel?.onMouseLeave}
            onClick={disabled ? void 0 : () => openPanel?.onClick(id)}
            tooltip={{
              renderTooltip: () => split,
            }}
          >
            <div
              ref={arrow}
              style={{display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 -1px'}}
            >
              <Arrow
                width={16}
                height={16}
                direction={
                  selected
                    ? (arrow.current?.getBoundingClientRect()?.top ?? 0) * 2 + 16 >= window.innerHeight
                      ? 'u'
                      : 'd'
                    : 'r'
                }
              />
            </div>
          </ToolbarItem>
        </ToolbarMenuPopup>
      </>
    );
  }

  return (
    <ToolbarMenuPopup header={!item.noHeader} open={selected} item={item}>
      <ToolbarItem
        {...(item.pane || item.chevronOnly || item.iconOnly ? {} : {width: 'auto'})}
        compact
        small={small}
        selected={selected || active}
        onMouseEnter={disabled ? void 0 : () => openPanel?.onMouseMove(id)}
        onMouseMove={disabled ? void 0 : () => openPanel?.onMouseMove(id)}
        onMouseLeave={disabled ? void 0 : openPanel?.onMouseLeave}
        onClick={disabled ? void 0 : (event) => toolbar?.execute(item, event)}
        disabled={disabled}
        tooltip={{
          shortcut: item.keys?.join(''),
          renderTooltip: () => item.name ?? item.id ?? '',
        }}
      >
        {item.pane || item.iconOnly ? (
          (item.icon?.() ?? <Iconista set={'elastic'} icon={'empty'} width={16} height={16} />)
        ) : item.chevronOnly ? (
          <div ref={arrow} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
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
        ) : (
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
        )}
      </ToolbarItem>
    </ToolbarMenuPopup>
  );
};
