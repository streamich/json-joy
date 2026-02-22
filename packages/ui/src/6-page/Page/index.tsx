import * as React from 'react';
import {rule} from 'nano-theme';
import useTitle from 'react-use/lib/useTitle';
import {NiceUiSizes} from '../../constants';

const blockClass = rule({
  maxW: NiceUiSizes.SiteWidth + NiceUiSizes.SitePadding + NiceUiSizes.SitePadding + 'px',
  minW: NiceUiSizes.MinSiteWidth + 'px',
  margin: 'auto',
  bxz: 'border-box',
  pad: `${NiceUiSizes.TopNavHeight}px 32px 0`,
  '@media only screen and (max-width: 600px)': {
    padl: '16px',
    padr: '16px',
  },
  '&:focus': {
    outline: 'none',
  },
});

export interface Props {
  hackFooterLocation?: boolean;
  withSubNav?: boolean;
  title?: string;
  children: React.ReactNode;
}

export const Page: React.FC<Props> = ({hackFooterLocation, withSubNav, title = 'json joy', children}) => {
  useTitle(title);

  const style: React.CSSProperties = {
    paddingTop: withSubNav ? NiceUiSizes.TopNavHeight : 0,
  };

  if (hackFooterLocation) {
    style.minHeight = '100vh';
    style.paddingBottom = NiceUiSizes.FooterHeight;
  }

  let element = (
    <main id="main-content" tabIndex={-1} className={blockClass} style={style}>
      {children}
    </main>
  );

  if (hackFooterLocation) {
    element = (
      <>
        {element}
        <div style={{marginTop: -NiceUiSizes.FooterHeight}} />
      </>
    );
  }

  return <>{element}</>;
};
