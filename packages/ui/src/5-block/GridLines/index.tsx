import * as React from 'react';
import {rule} from 'nano-theme';
import {NiceUiSizes} from '../../constants';

const padding = 32;
const lineColor = 'rgba(127,127,127,.12)';
const cornerDotColor = 'rgba(127,127,127,.5)';
const vertexDotColor = 'rgba(0,0,0,.7)';
const line = `1px solid ${lineColor}`;

const cornerDotSize = 3;
const cornerDotInset = 18;
const vertexDotSize = 2;
const vertexGap = 16;

const innerMaxWidth = NiceUiSizes.SiteWidth;
const innerHalf = innerMaxWidth / 2;

const s1 = `max(0px,calc(50% - ${innerHalf + vertexGap}px))`;
const s2 = `max(${vertexGap * 2}px,calc(50% - ${innerHalf - vertexGap}px))`;
const s3 = `min(calc(100% - ${vertexGap * 2}px),calc(50% + ${innerHalf - vertexGap}px))`;
const s4 = `min(100%,calc(50% + ${innerHalf + vertexGap}px))`;

const hLineGap =
  `linear-gradient(to right,` +
  `${lineColor} 0,` +
  `${lineColor} ${s1},` +
  `transparent ${s1},` +
  `transparent ${s2},` +
  `${lineColor} ${s2},` +
  `${lineColor} ${s3},` +
  `transparent ${s3},` +
  `transparent ${s4},` +
  `${lineColor} ${s4},` +
  `${lineColor} 100%)`;

const vLineGap =
  `linear-gradient(to bottom,` +
  `transparent 0,` +
  `transparent ${vertexGap}px,` +
  `${lineColor} ${vertexGap}px,` +
  `${lineColor} calc(100% - ${vertexGap}px),` +
  `transparent calc(100% - ${vertexGap}px),` +
  `transparent 100%)`;

const wrapCls = rule({pos: 'relative'});

const wrapBorderBotCls = rule({bdb: line});
const wrapBorderTopCls = rule({bdt: line});

const wrapGradBotCls = rule({
  bgi: hLineGap,
  bgs: '100% 1px',
  bgp: 'bottom',
  bgr: 'no-repeat',
});

const wrapGradBothCls = rule({
  bgi: `${hLineGap}, ${hLineGap}`,
  bgs: '100% 1px, 100% 1px',
  bgp: 'top, bottom',
  bgr: 'no-repeat',
});

const innerCls = rule({
  pos: 'relative',
  maxW: innerMaxWidth + 'px',
  minW: NiceUiSizes.MinSiteWidth + 'px',
  margin: '0 auto',
  bxz: 'border-box',
});

const innerPadCls = rule({
  pad: padding + padding + 'px ' + padding + 'px',
  '@media only screen and (max-width: 600px)': {
    padl: '16px',
    padr: '16px',
  },
});

const innerBorderCls = rule({
  // bdl: line,
  // bdr: line,
});

const innerGradCls = rule({
  bgi: `${vLineGap}, ${vLineGap}`,
  bgs: '1px 100%, 1px 100%',
  bgp: 'left, right',
  bgr: 'no-repeat',
});

const cornerDotCls = rule({
  pos: 'absolute',
  w: cornerDotSize + 'px',
  h: cornerDotSize + 'px',
  bdrad: '1px',
  bg: cornerDotColor,
  pointerEvents: 'none',
});

const vertexDotCls = rule({
  pos: 'absolute',
  w: vertexDotSize + 'px',
  h: vertexDotSize + 'px',
  bg: vertexDotColor,
  pointerEvents: 'none',
});

const vertexBulletCls = rule({
  pos: 'absolute',
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  col: vertexDotColor,
  pointerEvents: 'none',
});

export interface GridLinesProps {
  noTop?: boolean;
  cornerDots?: boolean;
  vertexDots?: boolean;
  vertexBullet?: React.ReactNode;
  /** Size of the bullet wrapper in px. Must be odd for pixel-sharp centering. */
  vertexBulletSize?: number;
  className?: string;
  noPadding?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const GridLines: React.FC<GridLinesProps> = ({
  noTop,
  cornerDots,
  vertexDots,
  vertexBullet,
  vertexBulletSize = 9,
  className,
  noPadding,
  style,
  children,
}) => {
  const hasBullet = vertexDots && vertexBullet !== undefined && vertexBullet !== null && vertexBullet !== false;
  const bulletHalf = Math.floor(vertexBulletSize / 2);
  const renderVertex = (corner: 'tl' | 'tr' | 'bl' | 'br') => {
    if (hasBullet) {
      const st: React.CSSProperties = {width: vertexBulletSize, height: vertexBulletSize};
      if (corner === 'tl') {
        st.top = -bulletHalf;
        st.left = -bulletHalf;
      } else if (corner === 'tr') {
        st.top = -bulletHalf;
        st.right = -bulletHalf;
      } else if (corner === 'bl') {
        st.bottom = -bulletHalf;
        st.left = -bulletHalf;
      } else {
        st.bottom = -bulletHalf;
        st.right = -bulletHalf;
      }
      return (
        <span className={vertexBulletCls} style={st}>
          {vertexBullet}
        </span>
      );
    }
    const st: React.CSSProperties = {};
    if (corner === 'tl') {
      st.top = 0;
      st.left = 0;
      st.transform = 'translate(-50%,-50%)';
    } else if (corner === 'tr') {
      st.top = 0;
      st.right = 0;
      st.transform = 'translate(50%,-50%)';
    } else if (corner === 'bl') {
      st.bottom = 0;
      st.left = 0;
      st.transform = 'translate(-50%,50%)';
    } else {
      st.bottom = 0;
      st.right = 0;
      st.transform = 'translate(50%,50%)';
    }
    return <span className={vertexDotCls} style={st} />;
  };
  const wrapClasses =
    wrapCls +
    ' ' +
    (vertexDots
      ? noTop
        ? wrapGradBotCls
        : wrapGradBothCls
      : noTop
        ? wrapBorderBotCls
        : wrapBorderBotCls + ' ' + wrapBorderTopCls);

  const innerClasses =
    innerCls +
    (noPadding ? '' : ' ' + innerPadCls) +
    ' ' +
    (vertexDots ? innerGradCls : innerBorderCls) +
    (className ? ' ' + className : '');

  return (
    <div className={wrapClasses}>
      <div className={innerClasses} style={style}>
        {cornerDots && !noTop && <span className={cornerDotCls} style={{top: cornerDotInset, left: cornerDotInset}} />}
        {cornerDots && !noTop && <span className={cornerDotCls} style={{top: cornerDotInset, right: cornerDotInset}} />}
        {cornerDots && <span className={cornerDotCls} style={{bottom: cornerDotInset, left: cornerDotInset}} />}
        {cornerDots && <span className={cornerDotCls} style={{bottom: cornerDotInset, right: cornerDotInset}} />}
        {vertexDots && !noTop && renderVertex('tl')}
        {vertexDots && !noTop && renderVertex('tr')}
        {vertexDots && renderVertex('bl')}
        {vertexDots && renderVertex('br')}
        {children}
      </div>
    </div>
  );
};

export default GridLines;
