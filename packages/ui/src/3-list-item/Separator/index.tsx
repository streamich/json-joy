import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = rule({
  h: '1px',
  ov: 'hidden',
});

export interface Props {
  invisible?: boolean;
  hard?: boolean;
  style?: React.CSSProperties;
}

export const Separator: React.FC<Props> = ({invisible, hard, style}) => {
  const styles = useStyles();
  return (
    <div
      className={blockClass}
      style={{
        ...(style || {}),
        background: invisible ? undefined : styles.g(0, (hard ? 2 : 1) * 0.08),
      }}
    />
  );
};
