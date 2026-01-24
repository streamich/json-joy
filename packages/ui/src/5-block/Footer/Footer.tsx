import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import useWindowSize from 'react-use/lib/useWindowSize';
import {SeparatorColorful} from '../../3-list-item/SeparatorColorful';
import {PageWidth} from '../../6-page/PageWidth';
import {NiceUiSizes} from '../../constants';

const breakpoint = 1000;

const blockClass = rule({
  pd: '72px 0 0',
  mrb: '75vh',
});

const paddingClass = rule({
  d: 'flex',
  fw: 'wrap',
  jc: 'space-between',
  w: '100%',
  maxW: NiceUiSizes.SiteWidth + 'px',
  bxz: 'border-box',
  mr: '0 auto',
  pd: '36px 0 64px 0',
});

export interface FooterProps {
  narrow?: boolean;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export const Footer: React.FC<FooterProps> = ({narrow, footer, children}) => {
  const {width} = useWindowSize();
  const [hovered, setHovered] = React.useState(false);
  const theme = useTheme();

  const isMedium = width < 1100;

  const isLarge = width > breakpoint;

  let element = (
    <div
      style={{
        background: theme.g(0.98),
        margin: isLarge ? (narrow ? '0 64px' : undefined) : '0 16px',
        padding: isLarge ? '0 64px' : '0 16px',
        borderRadius: '10px',
        marginBottom: 100,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={paddingClass} style={{display: isMedium ? 'block' : undefined}}>
        {children}
      </div>
      <SeparatorColorful contrast grey={!hovered} />
      {!!footer && <div style={{display: 'flex', padding: '48px 0 64px', justifyContent: 'center'}}>{footer}</div>}
    </div>
  );

  if (isLarge) {
    element = <PageWidth>{element}</PageWidth>;
  }

  return <footer className={blockClass}>{element}</footer>;
};
