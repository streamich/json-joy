import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {BasicTooltip} from '@jsonjoy.com/ui/src/4-card/BasicTooltip';

const rootClass = rule({
  d: 'inline-flex',
  h: '42px',
  w: '48px',
  mr: '0 0 4px',
  ai: 'center',
  jc: 'center',
  us: 'none',
});

const muClass = rule({
  ...theme.font.serif.mid,
  letterSpacing: '.05em',
  d: 'inline-flex',
  tr: 'translateY(1px)',
  sub: {
    fz: '15.3px',
  },
  trs: 'letter-spacing 0.1s ease, transform 0.1s ease',
  [`.${rootClass.trim()}:hover &`]: {
    letterSpacing: '-0.065em',
    tr: 'translateY(4px)',
  },
});

const txtClass = rule({
  ...theme.font.slab.bold,
  fz: '22.5px',
});

const txt1Class = rule({
  letterSpacing: '.03em',
  d: 'inline-flex',
  trs: 'letter-spacing 0.1s ease, transform 0.1s ease',
  [`.${rootClass.trim()}:hover &`]: {
    letterSpacing: '-0.03em',
    tr: 'translateY(-2px)',
  },
});

const txt2Class = rule({
  letterSpacing: '.02em',
  d: 'inline-flex',
  trs: 'letter-spacing 0.1s ease, transform 0.1s ease',
  [`.${rootClass.trim()}:hover &`]: {
    letterSpacing: '0em',
    tr: 'translateY(3px)',
  },
});

const txt3Class = rule({
  d: 'inline-flex',
  trs: 'letter-spacing 0.1s ease, transform 0.1s ease',
  [`.${rootClass.trim()}:hover &`]: {
    letterSpacing: '.01em',
    tr: 'translateY(8px)',
  },
});

const buttonHoverClass = rule({
  // ['&:hover .' + muClass.trim()]: {
  //   letterSpacing: '0.05em',
  // },
  
  // ['&:hover .' + txt2Class.trim()]: {
  //   letterSpacing: '.01em',
  //   // tr: 'translateY(3px)',
  // },
  // ['&:hover .' + txt3Class.trim()]: {
  //   letterSpacing: '.01em',
  //   // tr: 'translateY(8px)',
  // },
});

export interface BrandLogoProps {}

export const BrandLogo: React.FC<BrandLogoProps> = () => {
  const label = '\\mu txt — Micro rich-text editor';

  return (
    <BasicTooltip nowrap renderTooltip={() => label}>
      <span className={rootClass + buttonHoverClass} role="img" aria-label={label}>
        <span className={muClass}><sub>μ</sub></span>
        {/* <span className={mu2Class}>mu</span> */}
        <span className={txtClass}>
          <span className={txt1Class}>t</span>
          <span className={txt2Class}>x</span>
          <span className={txt3Class}>t</span>
        </span>
      </span>
    </BasicTooltip>
  );
};