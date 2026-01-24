import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {lineHeight} from './constants';

const blockClass = rule({
  d: 'inline-block',
  w: '100%',
  maxW: 12 * lineHeight + 'px',
  h: 3 * lineHeight + 'px',
  mar: '4px 0 0',
  bdrad: '3px',
});

type Props = {};

const ImagePlaceholder: React.FC<Props> = () => {
  const theme = useTheme();
  const background = theme.g(0, 0.1);

  return <span className={blockClass} style={{background}} />;
};

export default ImagePlaceholder;
