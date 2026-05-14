import {Button, type ButtonProps} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import * as React from 'react';
import PlusIcon__svg from 'iconista/lib/react/bootstrap/plus-square-dotted';

// const PlusIcon = makeIcon({set: 'auth0', icon: 'plus'});
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <PlusIcon__svg {...props} />;

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
  icon = <PlusIcon width={16} height={16} />,
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
