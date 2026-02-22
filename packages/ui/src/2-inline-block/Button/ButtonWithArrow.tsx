import * as React from 'react';
import Svg from 'iconista';
import {Button, type ButtonProps} from './Button';

const icon = <Svg set="atlaskit" icon="arrow-right" width={18} height={18} />;

export interface Props extends ButtonProps {
  primary?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export const ButtonWithArrow: React.FC<Props> = ({children, ...rest}) => {
  return (
    <Button ghost icon={icon} iconRight {...rest}>
      {children}
    </Button>
  );
};
