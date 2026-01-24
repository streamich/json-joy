import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {lineHeight} from './constants';

const blockClass = rule({
  d: 'inline-block',
  w: '40%',
  h: lineHeight + 'px',
  mar: '4px 0 0',
  bdrad: '3px',
});

type Props = {};

const HeadingPlaceholder: React.FC<Props> = () => {
  const theme = useTheme();
  const background = theme.g(0, 0.1);

  return <span className={blockClass} style={{background}} />;
};

export default HeadingPlaceholder;
