import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {lineHeight} from './constants';

const blockClass = rule({
  d: 'inline-block',
  w: '100%',
});

const greyClass = rule({
  d: 'inline-block',
  h: lineHeight + 'px',
  mar: '4px 0 0',
  bdrad: '3px',
});

type Props = {};

const ParagraphPlaceholder: React.FC<Props> = React.memo(() => {
  const styles = useStyles();
  const background = styles.g(0, 0.1);

  return (
    <span className={blockClass}>
      <span className={greyClass} style={{background, width: 70 + Math.random() * 10 + '%'}} />
    </span>
  );
});

export default ParagraphPlaceholder;
