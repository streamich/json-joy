import * as React from 'react';
import Svg from 'iconista';
import {lightTheme, rule, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import BasicButton from '../BasicButton';
import {Link} from '../../1-inline/Link';

const blockClass = drule({
  ...lightTheme.font.ui2.mid,
  fz: '14px',
  d: 'inline-flex',
  alignItems: 'center',
  svg: {
    marr: '8px',
  },
});

const linkWithUnderlineClass = rule({
  bdb: '1px solid transparent',
  '&:hover': {
    bdb: '1px solid rgba(244,18,36,.3)',
  },
});

const backButtonClass = rule({
  mar: '-4px 4px -4px -8px',
  d: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const backButtonInnerClass = rule({
  pad: '0 0 0 8px',
  d: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export interface Props {
  to: string;
  children?: React.ReactNode;
}

const LinkBack: React.FC<Props> = ({to, children}) => {
  const styles = useStyles();
  const link = styles.col.get('link', 'solid-1');
  return (
    <span
      className={blockClass({
        col: styles.g(0.3),
        fill: styles.g(0.3),
        '&:hover': {
          col: link,
          fill: link,
        },
      })}
    >
      <BasicButton to={to} noOutline round size={28} className={backButtonClass}>
        <span className={backButtonInnerClass}>
          {/* <Iconista set="atlaskit" icon="arrow-left" width={16} height={16} /> */}
          <Svg set="ibm_16" icon="arrow--left" width={16} height={16} />
        </span>
      </BasicButton>
      <Link a to={to} className={linkWithUnderlineClass}>
        {children}
      </Link>
    </span>
  );
};

export default LinkBack;
