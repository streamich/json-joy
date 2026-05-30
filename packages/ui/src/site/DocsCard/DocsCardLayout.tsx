import * as React from 'react';
import {rule} from 'nano-theme';
import {NiceUiSizes} from '../../constants';

const wrapClass = rule({
  bxz: 'border-box',
  maxW: NiceUiSizes.SiteWidth + NiceUiSizes.SitePadding * 2 + 'px',
  mar: '0 auto',
  pad: NiceUiSizes.SitePadding + 'px',
  '@media only screen and (max-width: 600px)': {pad: '16px'},
});

const gridClass = rule({
  d: 'grid',
  mar: '0 -20px',
});

export interface DocsCardLayoutProps {
  cols?: number;
  children?: React.ReactNode;
}

export const DocsCardLayout: React.FC<DocsCardLayoutProps> = ({cols = 3, children}) => {
  return (
    <div className={wrapClass}>
      <div className={gridClass} style={{gridTemplateColumns: `repeat(${cols}, 1fr)`}}>
        {children}
      </div>
    </div>
  );
};

export default DocsCardLayout;
