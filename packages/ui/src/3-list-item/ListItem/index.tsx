import * as React from 'react';
import {Link} from '../../1-inline/Link';
import {BasicButtonMore} from '../../2-inline-block/BasicButton/BasicButtonMore';
import {Popup} from '../../4-card/Popup';
import {Ripple} from '../../misc/Ripple';
import {rule, makeRule, theme, useRule} from 'nano-theme';
import {FixedColumn} from '../FixedColumn';
import {highlightClass} from './highlightClass';

const padding = 16;

const blockClass = rule({
  d: 'block',
  bxz: 'border-box',
  cur: 'pointer',
  bdrad: '4px',
  '&+&': {
    mart: '8px',
  },
});

const useBlockClass = makeRule((theme) => ({
  bg: theme.g(0, 0.02),
  '&:hover': {
    bg: theme.g(0, 0.06),
  },
}));

const linkClass = rule({
  d: 'block',
  bxz: 'border-box',
  cur: 'pointer',
  bdrad: '4px',
  pad: `${padding}px`,
});

const iconClass = rule({
  w: '32px',
  h: '32px',
  bdrad: '50%',
  // bd: `1px solid ${theme.blueColor(.5)}`,
  // bd: `1px solid ${theme.blue}`,
  bxz: 'border-box',
  d: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  svg: {
    fill: theme.color.sem.blue[0],
    stroke: theme.color.sem.blue[0],
  },
});

const titleClass = rule({
  ...theme.font.ui1.mid,
  d: 'block',
});

export interface Props {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  to?: string;
  isNew?: boolean;
  renderContext?: () => React.ReactElement<any>;
}

export const ListItem: React.FC<Props> = ({title, subtitle, icon, to, isNew, renderContext}) => {
  const dynamicBlockClass = useBlockClass();
  const dynamicTitleClass = useRule((theme) => ({
    col: theme.g(0.3),
  }));

  let element: React.ReactElement = <span className={titleClass + dynamicTitleClass}>{title}</span>;

  if (subtitle) {
    element = (
      <span>
        {element}
        <span style={{display: 'block', fontSize: '.9em'}}>{subtitle}</span>
      </span>
    );
  }

  if (icon) {
    element = (
      <FixedColumn as={'span'} left={48}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <span className={iconClass}>{icon}</span>
        </span>
        {element}
      </FixedColumn>
    );
  }

  if (to) {
    element = (
      <Ripple>
        <Link a to={to} className={linkClass}>
          {element}
        </Link>
      </Ripple>
    );
  }

  if (renderContext) {
    element = (
      <FixedColumn as={'span'} right={32 + padding}>
        <span>{element}</span>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <span style={{width: 32, display: 'inline-block'}}>
            <Popup renderContext={renderContext}>
              <BasicButtonMore size={32} />
            </Popup>
          </span>
        </span>
      </FixedColumn>
    );
  }

  element = <div className={blockClass + dynamicBlockClass + (isNew ? highlightClass : '')}>{element}</div>;

  return element;
};
