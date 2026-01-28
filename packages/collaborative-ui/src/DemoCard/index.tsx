import * as React from 'react';
import {rule} from 'nano-theme';
import {Text} from '@jsonjoy.com/ui/lib/1-inline/Text';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import BasicButton from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {Fade} from '@jsonjoy.com/ui/lib/4-card/Fade';

const blockClass = rule({
  // pd: '16px',
});

const headerClass = rule({
  pd: '16px 16px 0',
  bxz: 'border-box',
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
  mr: '2px 0 0',
  fz: '19px',
  op: 0.8,
  lh: '1.5em',
});

const descriptionWrapClass = rule({
  pd: '16px',
  mr: '0 auto',
});

const descriptionClass = rule({
  pd: '32px',
  mr: '0 auto',
  lh: '1.7em',
  maxW: '800px',
});

export interface DemoCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

export const DemoCard: React.FC<DemoCardProps> = ({title, subtitle, description, children}) => {
  const [showDescription, setShowDescription] = React.useState(false);

  return (
    <Paper className={blockClass} fill={1} noOutline round>
      {(!!title || !!subtitle || !!description) && (
        <div className={headerClass}>
          <Split style={{alignItems: 'center'}}>
            <div>
              {!!title && <Text as='h3' font='sans' kind='bold' className={titleClass}>{title}</Text>}
              {!!subtitle && <Text as='h3' font='slab' kind='mid' className={subtitleClass}>{subtitle}</Text>}
            </div>
            <div>
              {!!description && (
                <BasicTooltip renderTooltip={() => (showDescription ? 'Hide description' : 'Show description')} nowrap>
                  <BasicButton fill={showDescription} rounder size={40} onClick={() => setShowDescription(x => !x)}>
                    <Iconista set='tabler' icon='book' width={16} height={16} />
                  </BasicButton>
                </BasicTooltip>
              )}
            </div>
          </Split>
        </div>
      )}
      <Fade height={150}>
        <div className={descriptionWrapClass}>
          <Paper round>
            <div className={descriptionClass}>
              <Text as='div' font='sans' kind='mid' size={1} className={subtitleClass}>{description}</Text>
              {/* {description} */}
            </div>
          </Paper>
        </div>
      </Fade>
      {!!showDescription ? (
        <div className={descriptionWrapClass}>
          <Paper round>
            <div className={descriptionClass}>
              <Text as='div' font='sans' kind='mid' size={1} className={subtitleClass}>{description}</Text>
              {/* {description} */}
            </div>
          </Paper>
        </div>
      ) : (
        <div className={bodyClass}>{children}</div>
      )}
    </Paper>
  );
};
