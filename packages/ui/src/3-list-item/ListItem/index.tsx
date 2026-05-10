import * as React from 'react';
import {lightTheme, rule, drule} from 'nano-theme';
import {Link} from '../../1-inline/Link';
import {BasicButtonMore} from '../../2-inline-block/BasicButton/BasicButtonMore';
import {Popup} from '../../4-card/Popup';
import {Ripple} from '../../misc/Ripple';
import {useStyles} from '../../styles/context';
import {FixedColumn} from '../FixedColumn';
import {highlightClass} from './highlightClass';

const padding = 16;

const blockClass = drule({
  d: 'block',
  bxz: 'border-box',
  cur: 'pointer',
  bdrad: '4px',
  '&+&': {
    mart: '8px',
  },
});

const linkClass = rule({
  d: 'block',
  bxz: 'border-box',
  cur: 'pointer',
  bdrad: '4px',
  pad: `${padding}px`,
});

const iconClass = drule({
  w: '32px',
  h: '32px',
  bdrad: '50%',
  bxz: 'border-box',
  d: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const titleClass = drule({
  ...lightTheme.font.ui1.mid,
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
  const styles = useStyles();
  const link = styles.col.get('link', 'solid-1');

  let element: React.ReactElement = <span className={titleClass({col: styles.g(0.3)})}>{title}</span>;

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
          <span className={iconClass({svg: {fill: link, stroke: link}})}>{icon}</span>
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

  element = (
    <div
      className={
        blockClass({
          bg: styles.g(0, 0.02),
          '&:hover': {bg: styles.g(0, 0.06)},
        }) + (isNew ? ' ' + highlightClass : '')
      }
    >
      {element}
    </div>
  );

  return element;
};
