import * as React from 'react';
import {distinctUntilChanged, fromEvent, map} from 'rxjs';
import {rule, makeRule, ZINDEX} from 'nano-theme';
import useWindowSize from 'react-use/lib/useWindowSize';
import useObservable from 'react-use/lib/useObservable';
import {useContentSize} from '../../6-page/ContentSizer/context';
import {NiceUiSizes} from '../../constants';

const blockClass = rule({
  w: '100%',
  bxz: 'border-box',
  pos: 'fixed',
  top: 0,
  left: 0,
  pd: '0 32px',
  z: ZINDEX.TOP_NAV,
  bdfl: 'saturate(170%) blur(14px)',
  bdb: '1px solid transparent',
  '-webkit-app-region': 'drag', // Drag for Electron app.
  '@media only screen and (max-width: 600px)': {
    pad: '0px 16px',
  },
});

const useBlockClass = makeRule((theme) => ({
  bdb: `1px solid ${theme.g(0, 0.08)}`,
  '&:hover': {
    bdb: `1px solid ${theme.g(0, 0.12)}`,
  },
}));

const sizerClass = rule({
  maxW: NiceUiSizes.SiteWidth + 'px',
  h: NiceUiSizes.TopNavHeight + 'px',
  mar: 'auto auto -1px',
  bxz: 'border-box',
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
});

const useSizerClass = makeRule((theme) => ({
  bdb: `1px solid ${theme.g(0, 0.04)}`,
  '&:hover': {
    bdb: `1px solid ${theme.g(0, 0.08)}`,
  },
}));

const showBorder$ = fromEvent(window, 'scroll').pipe(
  map(() => window.scrollY > 10),
  distinctUntilChanged(),
);

export interface TopNavProps extends React.HTMLAttributes<any> {}

export const TopNav: React.FC<TopNavProps> = (props) => {
  const {children, ...rest} = props;
  const {width} = useWindowSize();
  const showBorder = useObservable(showBorder$, false);
  const dynamicBlockClass = useBlockClass();
  const dynamicSizerClass = useSizerClass();
  const {paddingLeft} = useContentSize();

  const showBorder2 = showBorder || width < 800;

  return (
    <>
      <nav
        data-testid="TopNav"
        {...rest}
        className={(rest.className || '') + blockClass + (showBorder2 ? dynamicBlockClass : '')}
        style={{marginLeft: paddingLeft, width: `calc(100% - ${paddingLeft}px)`}}
      >
        <div
          className={sizerClass + dynamicSizerClass}
          style={{borderBottomColor: showBorder2 ? 'transparent' : undefined}}
        >
          {children}
        </div>
      </nav>
      <div style={{height: NiceUiSizes.TopNavHeight}} />
    </>
  );
};
