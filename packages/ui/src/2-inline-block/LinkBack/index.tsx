import * as React from 'react';
import Svg from 'iconista';
import {rule, theme} from 'nano-theme';
import BasicButton from '../BasicButton';
import {Link} from '../../1-inline/Link';

const blockClass = rule({
  ...theme.font.ui2.mid,
  fz: '14px',
  col: theme.g(0.3),
  fill: theme.g(0.3),
  d: 'inline-flex',
  alignItems: 'center',
  svg: {
    marr: '8px',
  },
  '&:hover': {
    col: theme.blue,
    fill: theme.blue,
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
  return (
    <span className={blockClass}>
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
