import * as React from 'react';
import {rule, SIZE, theme} from 'nano-theme';

const blockClass = rule({
  maxW: `${SIZE.SITE_WIDTH + theme.space(1) + theme.space(1)}px`,
  bxz: 'border-box',
  pad: `0px ${theme.space(1)}px`,
  mar: '0 auto',
  '@media (max-width:600px)': {
    pad: `${theme.space(0)}px ${theme.space(0)}px`,
  },
});

export interface Props {
  page?: boolean;
  children: React.ReactNode;
}

export const Sizer: React.FC<Props> = ({page, children}) => {
  const style: React.CSSProperties = {};

  if (page) {
    style.maxWidth = `${SIZE.PAGE_WIDTH}px`;
  }

  return (
    <div className={blockClass} style={style}>
      {children}
    </div>
  );
};
