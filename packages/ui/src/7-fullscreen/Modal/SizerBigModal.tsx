import * as React from 'react';
import {rule, lightTheme as theme} from 'nano-theme';
import useWindowSize from 'react-use/lib/useWindowSize';

const wrapTopPadding = 80;
const minHorizontalMargin = 30;
const minHorizontalPadding = 0;

const blockClass = rule({
  margin: '-88px -24px -32px',
  d: 'flex',
  flexDirection: 'column',
  bxz: 'border-box',
  pos: 'relative',
  pad: '0 0 24px',
});

const wrapClass = rule({
  d: 'flex',
  flex: '1 1 100%',
  w: '100%',
  h: '100%',
  mar: '0 auto',
  pad: `${wrapTopPadding}px 0 0`,
});

const headerClass = rule({
  pos: 'absolute',
  h: '40px',
  w: 'calc(100% - 100px)',
  top: `${theme.space(0)}px`,
  left: `${theme.space(0)}px`,
});

interface Props {
  header?: React.ReactElement;
  wide?: boolean;
  narrow?: boolean;
  children: React.ReactNode | ((width: number) => React.ReactNode);
}

export const SizerBigModal: React.FC<Props> = ({header, narrow, wide, children}) => {
  const {width, height} = useWindowSize();

  const availableContentWidth =
    width - minHorizontalMargin - minHorizontalMargin - minHorizontalPadding - minHorizontalPadding;
  const blockTopPadding = height > 700 ? 64 : 16;
  const blockHeight = height - blockTopPadding - blockTopPadding;

  const style: React.CSSProperties = {
    minHeight: blockHeight,
  };

  const wrapStyle: React.CSSProperties = {
    minWidth: Math.min(availableContentWidth, narrow ? 640 : wide ? 1200 : 960),
    maxWidth: narrow ? 640 : undefined,
  };

  return (
    <div className={blockClass} style={style}>
      {!!header && <div className={headerClass}>{header}</div>}
      <div className={wrapClass} style={wrapStyle}>
        {typeof children === 'function' ? (children as any)(availableContentWidth) : children}
      </div>
    </div>
  );
};
