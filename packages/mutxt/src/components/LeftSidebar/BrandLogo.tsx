import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {BasicTooltip} from '@jsonjoy.com/ui/src/4-card/BasicTooltip';

const rootClass = rule({
  d: 'inline-flex',
  ai: 'center',
  pd: '0 0 4px',
  us: 'none',
});

const muClass = rule({
  ...theme.font.serif.mid,
  fz: '20.5px',
});

const txtClass = rule({
  ...theme.font.slab.bold,
  fz: '22.5px',
});

export interface BrandLogoProps {}

export const BrandLogo: React.FC<BrandLogoProps> = () => {
  const label = '\\mu txt: Micro rich-text editor';

  return (
    <BasicTooltip nowrap renderTooltip={() => label}>
      <span className={rootClass} role="img" aria-label={label}>
        <span className={muClass}><sub>μ</sub></span>
        <span className={txtClass}>
          <span style={{letterSpacing: '.03em'}}>t</span>
          <span style={{letterSpacing: '.01em'}}>x</span>
          <span>t</span>
        </span>
      </span>
    </BasicTooltip>
  );
};