import * as React from 'react';
import {distinctUntilChanged, fromEvent, map} from 'rxjs';
import {drule, ZINDEX} from 'nano-theme';
import {useStyles} from '../../styles/context';
import useWindowSize from 'react-use/lib/useWindowSize';
import useObservable from 'react-use/lib/useObservable';
import {useContentSize} from '../../6-page/ContentSizer/context';
import {NiceUiSizes} from '../../constants';

const blockClass = drule({
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

const sizerClass = drule({
  maxW: NiceUiSizes.SiteWidth + 'px',
  h: NiceUiSizes.TopNavHeight + 'px',
  mar: 'auto auto -1px',
  bxz: 'border-box',
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
});

const showBorder$ = fromEvent(window, 'scroll').pipe(
  map(() => window.scrollY > 10),
  distinctUntilChanged(),
);

export interface TopNavProps extends React.HTMLAttributes<any> {}

export const TopNav: React.FC<TopNavProps> = (props) => {
  const {children, ...rest} = props;
  const {width} = useWindowSize();
  const showBorder = useObservable(showBorder$, false);
  const styles = useStyles();
  const {paddingLeft} = useContentSize();

  const showBorder2 = showBorder || width < 800;

  const blockCls = blockClass(
    showBorder2
      ? {
          bdb: `1px solid ${styles.g(0, 0.08)}`,
          '&:hover': {bdb: `1px solid ${styles.g(0, 0.12)}`},
        }
      : {},
  );
  const sizerCls = sizerClass({
    bdb: `1px solid ${styles.g(0, 0.04)}`,
    '&:hover': {bdb: `1px solid ${styles.g(0, 0.08)}`},
  });

  return (
    <>
      <nav
        data-testid="TopNav"
        {...rest}
        className={(rest.className || '') + blockCls}
        style={{marginLeft: paddingLeft, width: `calc(100% - ${paddingLeft}px)`}}
      >
        <div className={sizerCls} style={{borderBottomColor: showBorder2 ? 'transparent' : undefined}}>
          {children}
        </div>
      </nav>
      <div style={{height: NiceUiSizes.TopNavHeight}} />
    </>
  );
};
