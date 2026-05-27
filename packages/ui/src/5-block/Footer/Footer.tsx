import * as React from 'react';
import {rule, m1} from 'nano-theme';
import {useStyles} from '../../styles/context';
import useWindowSize from 'react-use/lib/useWindowSize';
import {PageWidth} from '../../6-page/PageWidth';
import {NiceUiSizes} from '../../constants';
import {Line} from '../../3-list-item/Line';

const breakpoint = 1000;

const blockClass = rule({
  pd: '72px 0 0',
  mrb: '75vh',
  a: {bdrad: 0},
  'a:hover': {td: 'none'},
});

const paddingClass = rule({
  d: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '0 32px',
  jc: 'start',
  w: '100%',
  maxW: NiceUiSizes.SiteWidth + 'px',
  bxz: 'border-box',
  mr: '0 auto',
  pd: '36px 0 64px 0',
  [m1]: {gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0 24px'},
});

export interface FooterProps {
  narrow?: boolean;
  footer?: React.ReactNode;
  /** Absolutely positioned node rendered inside the footer card. */
  decoration?: React.ReactNode;
  children?: React.ReactNode;
}

export const Footer: React.FC<FooterProps> = ({narrow, footer, decoration, children}) => {
  const {width} = useWindowSize();
  const styles = useStyles();

  const isLarge = width > breakpoint;

  let element = (
    <div
      style={{
        position: 'relative',
        background: `linear-gradient(var(--colBgTint) 0%, var(--colBgTint2) 100%)`,
        margin: isLarge ? (narrow ? '0 64px' : undefined) : '0 16px',
        padding: isLarge ? '0 64px' : '0 16px',
        borderRadius: '24px',
        marginBottom: 100,
      }}
    >
      <div className={paddingClass}>{children}</div>
      <Line strokeWidth={2} style="squiggly" color={styles.neutral.fg.pct(0, -0.33, 0.33, -0.5) + ''} />
      {!!footer && <div style={{display: 'flex', padding: '48px 0 64px', justifyContent: 'center'}}>{footer}</div>}
      {decoration}
    </div>
  );

  if (isLarge) {
    element = <PageWidth>{element}</PageWidth>;
  }

  return <footer className={blockClass}>{element}</footer>;
};
