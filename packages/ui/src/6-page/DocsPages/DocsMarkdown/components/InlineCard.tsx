import {rule, theme} from 'nano-theme';
import * as React from 'react';
import {NiceUiSizes} from '../../../../constants';

const blockClass = rule({
  // bd: `1px solid ${theme.g(0.98)}`,
  bd: `1px solid ${theme.g(0.9)}`,
  bdrad: '8px',
  mar: '0 0 32px',
  pad: '32px',
  '&+p': {
    mart: '-32px',
  },
  // '&:hover': {
  //   bd: `1px solid ${theme.g(0.9)}`,
  // },
  // [`@media(max-width: ${Dimensions.SiteWidth}px)`]: {
  // bd: `1px solid ${theme.g(0.9)}`,
  // },
  [`@media(max-width: ${NiceUiSizes.BlogContentMaxWidth}px)`]: {
    pad: '16px',
  },
});

const contentsClass = rule({
  ...theme.font.ui2.mid,
  col: theme.g(0.5),
  fz: '10px',
  // ta: 'right',
  textTransform: 'uppercase',
  marb: '8px',
  bdb: `1px solid ${theme.g(0.92)}`,
  [`@media(max-width: ${NiceUiSizes.BlogContentMaxWidth}px)`]: {
    bdb: 0,
  },
  // [`@media(min-width: ${Dimensions.SiteWidth}px)`]: {
  //   op: 0.4,
  //   [`.${blockClass.trim()}:hover &`]: {
  //     op: 1,
  //   },
  // },
});

export interface Props {
  title: React.ReactNode;
  children: React.ReactNode;
}

const InlineCard: React.FC<Props> = ({title, children}) => {
  return (
    <div className={blockClass}>
      <div className={contentsClass}>{title}</div>
      {children}
    </div>
  );
};

export default InlineCard;
