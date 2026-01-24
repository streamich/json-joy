import * as React from 'react';
import {rule} from 'nano-theme';
import {fromEvent} from 'rxjs';
import {distinctUntilChanged, map, share} from 'rxjs/operators';
import useObservable from 'react-use/lib/useObservable';
import useWindowSize from 'react-use/lib/useWindowSize';
import Svg from 'iconista';
import {NiceUiSizes} from '../../constants';
import BasicButton from '../../2-inline-block/BasicButton';

const showBorder$ = fromEvent(window, 'scroll').pipe(
  map(() => window.scrollY),
  map((scroll) => scroll > 10),
  distinctUntilChanged(),
  share(),
);

const blockClass = rule({
  bxz: 'border-box',
  pos: 'sticky',
  top: NiceUiSizes.TopNavHeight + 'px',
  h: NiceUiSizes.TopNavHeight + 'px',
  maxH: NiceUiSizes.TopNavHeight + 'px',
  z: 10,
  backdropFilter: 'saturate(160%) blur(13px)',
  // bgc: 'rgba(255,255,255,.7)',
  bdb: '1px solid transparent',
  pad: '0 32px',
  minH: '64px',
  '@media only screen and (max-width: 600px)': {
    pad: '0px 16px',
  },
});

const wrapClass = rule({
  maxW: NiceUiSizes.SiteWidth + 'px',
  w: '100%',
  h: NiceUiSizes.TopNavHeight + 'px',
  maxH: NiceUiSizes.TopNavHeight + 'px',
  mar: 'auto auto -1px',
  bdb: '1px solid transparent',
});

const splitClass = rule({
  d: 'flex',
  justifyContent: 'space-between',
  bxz: 'border-box',
  w: '100%',
  h: NiceUiSizes.TopNavHeight + 'px',
  maxH: NiceUiSizes.TopNavHeight + 'px',
});

const backClass = rule({
  d: 'flex',
  alignItems: 'center',
  marr: '-2px',
});

const leftClass = rule({
  d: 'flex',
  alignItems: 'center',
  h: NiceUiSizes.TopNavHeight + 'px',
  maxH: NiceUiSizes.TopNavHeight + 'px',
});

const backButtonWrapperClass = rule({
  d: 'flex',
  alignItems: 'center',
});

const backButtonClass = rule({
  marl: '-12px',
  marr: '8px',
});

export interface SubNavProps {
  noBorder?: boolean;
  right?: React.ReactNode;
  backTo?: string;
  children?: React.ReactNode;
}

export const SubNav: React.FC<SubNavProps> = ({noBorder, right, backTo, children}) => {
  const showBorder = useObservable(showBorder$, false);
  const {width} = useWindowSize();

  const showBorder2 = showBorder || width < 800;

  const style: React.CSSProperties = {};
  const wrapStyle: React.CSSProperties = {
    borderColor: noBorder ? 'transparent' : showBorder2 ? 'transparent' : 'rgba(0,0,0,.08)',
  };

  if (showBorder2) {
    style.borderBottom = '1px solid rgba(0,0,0,.08)';
  }

  let content = children;

  if (backTo) {
    content = (
      <div className={backButtonWrapperClass} style={{marginLeft: width < 600 ? 0 : undefined}}>
        <BasicButton key={backTo} noOutline to={backTo} round size={40} className={backButtonClass}>
          {/* <Iconista set="atlaskit" icon="arrow-left" width={16} height={16} /> */}
          <Svg set="ibm_16" icon="arrow--left" width={16} height={16} />
        </BasicButton>
        {content}
      </div>
    );
  }

  return (
    <div className={blockClass} style={style}>
      <div className={wrapClass} style={wrapStyle}>
        <div className={splitClass}>
          <div className={leftClass}>{content}</div>
          {!!right && <div className={backClass}>{right}</div>}
        </div>
      </div>
    </div>
  );
};
