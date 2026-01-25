import {Button, type ButtonProps} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import * as React from 'react';

export interface CreateButtonProps extends ButtonProps {
  primary?: boolean;
  fill?: boolean;
  icon?: React.ReactElement;
  loading?: boolean;
  onClick: () => void;
  children?: React.ReactNode | undefined;
}

export const CreateButton: React.FC<CreateButtonProps> = ({
  primary,
  fill,
  icon = <Iconista set="auth0" icon="plus" width={16} height={16} />,
  onClick,
  children,
  ...rest
}) => {
  if (primary) {
    return (
      <Button {...rest} primary={fill} icon={icon!} onClick={onClick}>
        {children}
      </Button>
    );
  }

  return (
    <Button {...rest} icon={icon} ghost onClick={onClick}>
      {children}
    </Button>
  );
};
