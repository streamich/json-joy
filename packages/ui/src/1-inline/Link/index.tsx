import * as React from 'react';
import {Link as RouterLink, type LinkProps as RouterLinkProps} from '../../misc/router';

export interface LinkProps extends RouterLinkProps {}

export const Link: React.FC<LinkProps> = React.forwardRef((props, ref) => {
  const props2: any = {...props, ref};

  return (
    <RouterLink {...props2}>
      {props.children}
      {props.external ? ' ↗' : ''}
    </RouterLink>
  );
});
