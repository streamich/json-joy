import * as React from 'react';
import {Iconista} from '../../icons/Iconista';
import {Button, type ButtonProps} from './Button';

const icon = <Iconista set="tabler" icon="plus" width={18} height={18} />;

export interface ButtonAddProps extends ButtonProps {
  primary?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export const ButtonAdd: React.FC<ButtonAddProps> = ({children, ...rest}) => {
  return (
    <Button ghost icon={icon}>
      {children}
    </Button>
  );
};
