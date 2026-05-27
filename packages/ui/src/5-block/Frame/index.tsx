import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {PageWidth} from '../../6-page/PageWidth';
import {DisplayTitle, type DisplayTitleProps} from '../../4-card/DisplayTitle';
import {Space} from '../../3-list-item/Space';

const blockCls = rule({
  pos: 'relative',
  bg: '#fff',
  pd: '64px',
  bd: '1px solid rgba(127,127,127,.2)',
  bdrad: '32px',
  trs: 'border-radius .1s, background .3s',
  '&:hover': {
    bdrad: '16px',
    bd: '1px solid rgba(127,127,127,.5)',
    // bd: '1px solid transparent',
    // bg: 'rgba(127,127,127,.04)',
    bg: 'white',
    // bxsh: '0 0 2px rgba(0,0,0,.05), 0 0 4px rgba(0,0,0,.06), 0 0 0 1px rgba(255,255,255,.03)',
  },
});

const borderOnHoverCls = rule({
  bd: '1px solid transparent',
  '&:hover': {
    bd: '1px solid rgba(127,127,127,.3)',
  },
});

const fillOnHoverCls = rule({
  bg: '#fff',
  '&:hover': {
    bg: 'rgba(127,127,127,.04)',
  },
});

// Card surface is drawn by `::before` so it can grow past the section's box on
// hover without affecting surrounding layout.
const expandOnHoverCls = drule({});

const widerCls = rule({
  pd: '48px 80px',
  '@media only screen and (max-width: 800px)': {pd: '40px 40px'},
  '@media only screen and (max-width: 600px)': {pd: '28px 20px'},
});

const widerWrapCls = rule({
  mar: '0 -32px',
  '@media only screen and (max-width: 600px)': {mar: 0},
});

export interface FrameProps extends DisplayTitleProps {
  top?: React.ReactNode;
  narrow?: boolean;
  fill?: boolean;
  tint?: boolean;
  wider?: boolean;
  noBg?: boolean;
  noPadding?: boolean;
  noBorder?: boolean;
  borderOnHover?: boolean;
  fillOnHover?: boolean;
  expandOnHover?: boolean;
  shadowOnHover?: boolean;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Frame: React.FC<FrameProps> = ({
  top,
  narrow,
  fill,
  tint,
  noBg,
  wider,
  noPadding,
  noBorder,
  borderOnHover,
  fillOnHover,
  expandOnHover,
  shadowOnHover,
  children,
  className,
  style: _style,
  ...rest
}) => {
  const hasTitle = !!rest.title || !!rest.eyebrow || !!rest.subtitle;
  const style: React.CSSProperties = {};

  if (noPadding) {
    style.padding = 0;
    style.margin = 0;
  }

  if (noBorder) {
    style.border = 'none';
    style.boxShadow = 'none';
  }

  if (fill || tint) {
    style.background = tint ? 'var(--colBgTint)' : 'rgba(127,127,127,.04)';
  }

  if (noBg) {
    style.background = 'transparent';
  }

  // The pseudo-element draws the card surface, so the section itself must be
  // transparent and borderless to avoid a doubled, nested frame.
  let expandCls = '';
  if (expandOnHover) {
    const surfaceBg = noBg ? 'transparent' : tint ? 'var(--colBgTint)' : fill ? 'rgba(127,127,127,.04)' : '#fff';
    const surfaceBd = noBorder ? 'none' : '1px solid rgba(127,127,127,.2)';
    const surfaceBdHover = noBorder ? 'none' : '1px solid rgba(127,127,127,.45)';
    expandCls =
      ' ' +
      expandOnHoverCls({
        isolation: 'isolate',
        '&::before': {
          content: '""',
          pos: 'absolute',
          inset: 0,
          z: -1,
          bg: surfaceBg,
          bd: surfaceBd,
          bdrad: '32px',
          trs: 'inset .15s ease, box-shadow .15s ease, border-color .15s ease',
        },
        '&:hover::before': {
          inset: '-8px',
          bd: surfaceBdHover,
          bxsh: shadowOnHover ? '0 8px 24px rgba(18,26,48,.1), 0 2px 8px rgba(18,26,48,.06)' : 'none',
        },
      });
    style.background = 'transparent';
    style.border = 'none';
    style.boxShadow = 'none';
  }

  if (_style) {
    Object.assign(style, _style);
  }

  let content: React.ReactNode = (
    <section
      className={
        blockCls +
        (wider ? ' ' + widerCls : '') +
        (borderOnHover ? ' ' + borderOnHoverCls : '') +
        (fillOnHover ? ' ' + fillOnHoverCls : '') +
        expandCls +
        (className ? ' ' + className : '')
      }
      style={style}
    >
      {top}
      {hasTitle && <DisplayTitle {...rest} />}
      {hasTitle && <Space size={5} />}
      {children}
    </section>
  );

  if (wider || narrow)
    content = (
      <div
        className={wider ? widerWrapCls : undefined}
        style={narrow ? {maxWidth: '1200px', margin: '0 auto'} : undefined}
      >
        {content}
      </div>
    );

  content = <PageWidth>{content}</PageWidth>;

  return content;
};
