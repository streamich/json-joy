import {makeRule} from 'nano-theme';
import * as React from 'react';
import {NiceUiSizes} from '../../../../constants';

const useBlockClass = makeRule((t) => ({
  bd: `1px solid ${t.g(0.9)}`,
  bdrad: '8px',
  mar: '0 0 32px',
  pad: '32px',
  '&+p': {
    mart: '-32px',
  },
  [`@media(max-width: ${NiceUiSizes.BlogContentMaxWidth}px)`]: {
    pad: '16px',
  },
}));

const useContentsClass = makeRule((t) => ({
  ...t.font.ui2.mid,
  col: t.g(0.5),
  fz: '10px',
  textTransform: 'uppercase',
  marb: '8px',
  bdb: `1px solid ${t.g(0.92)}`,
  [`@media(max-width: ${NiceUiSizes.BlogContentMaxWidth}px)`]: {
    bdb: 0,
  },
}));

export interface Props {
  title: React.ReactNode;
  children: React.ReactNode;
}

const InlineCard: React.FC<Props> = ({title, children}) => {
  const blockClass = useBlockClass();
  const contentsClass = useContentsClass();
  return (
    <div className={blockClass}>
      <div className={contentsClass}>{title}</div>
      {children}
    </div>
  );
};

export default InlineCard;
