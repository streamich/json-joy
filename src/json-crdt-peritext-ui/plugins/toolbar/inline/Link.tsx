// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';

const delClass = rule({
  col: 'blue',
});

export interface LinkProps {
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = (props) => {
  const {children} = props;

  return <a className={delClass}>{children}</a>;
};
