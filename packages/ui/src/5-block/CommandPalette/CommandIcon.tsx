import * as React from 'react';
import {Iconista} from '../../icons/Iconista';

export interface CommandIconProps {
  set?: string;
  icon?: string;
  size?: number;
}

export const CommandIcon: React.FC<CommandIconProps> = ({set, icon, size = 16}) => {
  // if (!set || !icon) return <Iconista set="elastic" icon="console" width={16} height={16} />;
  if (!set || !icon) return <Iconista set="ant_outline" icon="caret-right" width={16} height={16} />;
  return <Iconista set={set as any} icon={icon as any} width={size} height={size} />;
};
