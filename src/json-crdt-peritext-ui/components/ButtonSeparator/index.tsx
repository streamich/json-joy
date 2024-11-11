// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  bd: 0,
  w: '3px',
  h: '26px',
  bdrad: '2px',
  mr: '0 4px',
  pd: 0,
  bg: 'rgba(61, 37, 20, .04)',
});

export const ButtonSeparator: React.FC = () => {
  return <div className={blockClass} />;
};
