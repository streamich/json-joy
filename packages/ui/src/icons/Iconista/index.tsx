import * as React from 'react';
import Svg from 'iconista';
import type {Icon} from 'iconista/lib/types';
import {useTheme} from 'nano-theme';

export type IconistaProps = Icon &
  React.SVGAttributes<any> & {
    colorStroke?: boolean;
    color?: string;
  };

export const Iconista: React.FC<IconistaProps> = ({colorStroke, color, ...rest}) => {
  const theme = useTheme();

  const iconColor = color || theme.g(0.4);

  return <Svg fill={iconColor} stroke={colorStroke ? iconColor : undefined} {...rest} />;
};
