import * as React from 'react';
import {rule} from 'nano-theme';
import {CopyButton} from '../CopyButton';
import {useT} from 'use-t';

const css = {
  block: rule({
    pos: 'relative',
    bxz: 'border-box',
    mr: 0,
    pd: 0,
    minH: '24px',
    w: '100%',
  }),
  copy: rule({
    pos: 'absolute',
    top: 0,
    right: 0,
    mr: 0,
    pd: 0,
  }),
  content: rule({
    ovy: 'auto',
  }),
};

export interface CopyTextProps {
  src: () => string;
  children?: React.ReactNode;
}

export const CopyText: React.FC<CopyTextProps> = ({src, children = src()}) => {
  const [_t] = useT();

  return (
    <div className={css.block}>
      <div className={css.copy}>
        <CopyButton onCopy={src} />
      </div>
      <div className={css.content}>{children}</div>
    </div>
  );
};
