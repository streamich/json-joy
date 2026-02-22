import * as React from 'react';
import {rule} from 'nano-theme';
import {NiceUiSizes} from '../../constants';

const padding = 32;

const blockClass = rule({
  maxW: NiceUiSizes.SiteWidth + padding + padding + 'px',
  minW: NiceUiSizes.MinSiteWidth + 'px',
  margin: 'auto',
  bxz: 'border-box',
  pad: '0 32px',
  '@media only screen and (max-width: 600px)': {
    padl: '16px',
    padr: '16px',
  },
});

export interface Props {
  children: React.ReactNode;
}

export const PageWidth: React.FC<Props> = ({children}) => {
  const element = <div className={blockClass}>{children}</div>;

  return element;
};
