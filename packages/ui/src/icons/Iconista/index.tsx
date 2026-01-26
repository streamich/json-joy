import * as React from 'react';
import Svg from 'iconista';
import {getUrl} from 'iconista/lib/getUrl';
import {useTheme} from 'nano-theme';
import type {Icon} from 'iconista/lib/types';

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

export const makeIcon = (icon: Partial<IconistaProps> & Icon): React.FC<Partial<Icon> & Omit<IconistaProps, keyof Icon>> => {
  // Preload
  const url = getUrl(icon);
  fetch(url, {cache: 'force-cache'}).catch(() => {});

  return (props) => React.createElement(Iconista, {...icon, ...props} as any);
};
