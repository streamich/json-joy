import * as React from 'react';
import Svg from 'iconista';
import {rule, drule, theme, useTheme} from 'nano-theme';
import useWindowSize from 'react-use/lib/useWindowSize';
import {useT} from 'use-t';
import {Link} from '../../1-inline/Link';
import {Paper} from '../../4-card/Paper';
import {Ripple} from '../../misc/Ripple';
import {Space} from '../../3-list-item/Space';

const blockClass = rule({
  d: 'flex',
});

const getNoteClass = drule({
  ...theme.font.ui3,
  d: 'block',
  fz: '14px',
  '@media only screen and (max-width: 500px)': {
    fz: '11px',
  },
});

const getTitleClass = drule({
  ...theme.font.ui2.bold,
  pad: '8px 0 0',
  d: 'block',
  fz: '20px',
  '@media only screen and (max-width: 500px)': {
    fz: '16px',
  },
});

const getCardClass = drule({
  d: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  bxz: 'border-box',
  pad: '16px',
  '@media only screen and (max-width: 500px)': {
    padl: '12px',
    padr: '12px',
  },
});

const arrowClass = rule({
  w: '24px',
});

const arrowLeftClass = rule({
  padl: '16px',
  trs: 'padding .1s ease-out',
  [`.${String(getCardClass).trim()}:hover &`]: {
    padl: '8px',
  },
});

const arrowRightClass = rule({
  padr: '16px',
  trs: 'padding .1s ease-out',
  [`.${String(getCardClass).trim()}:hover &`]: {
    padr: '8px',
  },
});

export interface Item {
  to: string;
  title: React.ReactNode;
}

export interface Props {
  left?: Item;
  right?: Item;
}

export const NextBlock: React.FC<Props> = ({left, right}) => {
  const [t] = useT();
  const {width} = useWindowSize();
  const theme = useTheme();

  const noteClass = getNoteClass({
    col: theme.g(0.6),
    [`.${String(getCardClass).trim()}:hover &`]: {
      col: theme.g(0.4),
    },
  });

  const titleClass = getTitleClass({
    col: theme.g(0.1),
    [`.${String(getCardClass).trim()}:hover &`]: {
      col: theme.g(0),
    },
  });

  const cardClass = getCardClass({
    svg: {
      fill: theme.g(0.6),
    },
    '&:hover': {
      svg: {
        fill: theme.g(0.3),
      },
    },
  });

  const leftElement = !left ? null : (
    // <Link key={left.to} a to={left.to} style={{flex: '1 1 100%'}} preload>
    <Link key={left.to} a to={left.to} style={{flex: '1 1 100%'}}>
      <Paper as={'span'} hoverElevate>
        <Ripple ms={700}>
          <span className={cardClass}>
            {width < 400 ? (
              <span />
            ) : (
              <span className={arrowRightClass + arrowLeftClass}>
                <Svg set="ibm_16" icon="arrow--left" width={24} height={24} />
              </span>
            )}
            <span>
              <span className={noteClass} style={{textAlign: 'right'}}>
                {t('Previous')}
              </span>
              <span className={titleClass} style={{textAlign: 'right'}}>
                {left.title}
              </span>
            </span>
          </span>
        </Ripple>
      </Paper>
    </Link>
  );

  const rightElement = !right ? null : (
    <Link key={right.to} a to={right.to} style={{flex: '1 1 100%'}}>
      {/* <Link key={right.to} a to={right.to} style={{flex: '1 1 100%'}} preload> */}
      <Paper as={'span'} hoverElevate>
        <Ripple ms={700}>
          <span className={cardClass}>
            <span>
              <span className={noteClass}>{t('Next')}</span>
              <span className={titleClass}>{right.title}</span>
            </span>
            {width < 400 ? (
              <span />
            ) : (
              <span className={arrowClass + arrowRightClass}>
                <Svg set="ibm_16" icon="arrow--right" width={24} height={24} />
              </span>
            )}
          </span>
        </Ripple>
      </Paper>
    </Link>
  );

  if (!leftElement && !rightElement) return null;
  if (!leftElement) return rightElement;
  if (!rightElement) return <div style={{width: '50%'}}>{leftElement}</div>;

  if (width < 800) {
    return (
      <div className={''}>
        {rightElement}
        <Space />
        {leftElement}
      </div>
    );
  }

  return (
    <div className={blockClass}>
      {leftElement}
      <div style={{width: 32, flex: '1 1 32px'}} />
      {rightElement}
    </div>
  );
};
