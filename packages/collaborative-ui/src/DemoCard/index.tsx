import * as React from 'react';
import {Text} from '@jsonjoy.com/ui/lib/1-inline/Text';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {rule} from 'nano-theme';

const blockClass = rule({
  // pd: '16px',
});

const headerClass = rule({
  pd: '16px 16px 0',
});

const bodyClass = rule({
  // mr: '0 -1px -1px',
  pd: '16px',
});

const titleClass = rule({
  pd: 0,
  mr: 0,
  fz: '27.5px',
  lh: '1.3em',
});

const subtitleClass = rule({
  pd: 0,
  mr: '-2px 0 0',
  fz: '19px',
  op: 0.8,
  lh: '1.8em',
});

export interface DemoCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}

export const DemoCard: React.FC<DemoCardProps> = ({title, subtitle, children}) => {
  return (
    <Paper className={blockClass} fill={1} noOutline round>
      {(!!title || !!subtitle) && (
        <div className={headerClass}>
          <Text as='h3' font='sans' kind='bold' className={titleClass}>{title}</Text>
          <Text as='h3' font='slab' kind='mid' className={subtitleClass}>{subtitle}</Text>
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </Paper>
  );
};
