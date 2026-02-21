import * as React from 'react';
import {FixedColumn} from '../../3-list-item/FixedColumn';
import {MiniTitle} from '../../3-list-item/MiniTitle';
import Arrow from '../../icons/interactive/Arrow';
import {ToolbarItem, type ToolbarItemProps} from './ToolbarItem';

export interface ToolbarTextItemProps extends Partial<ToolbarItemProps> {
  disabled?: boolean;
  onClick?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseMove?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
  children?: React.ReactNode;
}

export const ToolbarTextItem: React.FC<ToolbarTextItemProps> = ({
  disabled,
  onClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  children,
  ...rest
}) => {
  const arrow = <Arrow direction={'r'} width={16} height={16} />;
  const narrow = rest.small && !children;

  return (
    <ToolbarItem
      narrow={narrow}
      autowidth={!narrow}
      {...rest}
      skewed={false}
      compact
      rounder
      height={28}
      disabled={disabled}
      onMouseEnter={disabled ? void 0 : onMouseEnter}
      onMouseMove={disabled ? void 0 : onMouseMove}
      onMouseLeave={disabled ? void 0 : onMouseLeave}
      onClick={disabled ? void 0 : onClick}
    >
      {children ? (
        <FixedColumn right={16} style={{alignItems: 'center'}}>
          <MiniTitle>{children}</MiniTitle>
          <div style={{marginRight: -2, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{arrow}</div>
        </FixedColumn>
      ) : (
        arrow
      )}
    </ToolbarItem>
  );
};
