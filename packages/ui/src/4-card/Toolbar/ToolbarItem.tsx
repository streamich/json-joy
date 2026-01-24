import * as React from 'react';
import {BasicButton, type BasicButtonProps} from '../../2-inline-block/BasicButton';
import {BasicTooltip, type BasicTooltipProps} from '../BasicTooltip';
import type {AnchorPointComputeSpec} from '../../utils/popup';

const tooltipAnchor: AnchorPointComputeSpec = {center: true, gap: 8, topIf: 64};

export interface ToolbarItemProps extends BasicButtonProps {
  narrow?: boolean;
  small?: boolean;
  outline?: boolean;
  autowidth?: boolean;
  children?: React.ReactNode;
  tooltip?: BasicTooltipProps;
}

export const ToolbarItem: React.FC<ToolbarItemProps> = ({narrow, small, outline, autowidth, tooltip, ...rest}) => {
  const size = small ? 28 : 32;

  let element: React.ReactNode = (
    <BasicButton skewed width={autowidth ? 'auto' : narrow ? 20 : size} height={size} border={outline} {...rest} />
  );

  if (tooltip) {
    const height = (typeof rest.height === 'number' ? rest.height : void 0) ?? size ?? 32;
    element = (
      <BasicTooltip
        anchor={height === 32 ? tooltipAnchor : {...tooltipAnchor, gap: (tooltipAnchor.gap ?? 32) + (32 - height) / 2}}
        show={rest.disabled ? false : void 0}
        {...tooltip}
      >
        {element}
      </BasicTooltip>
    );
  }

  return <>{element}</>;
};
