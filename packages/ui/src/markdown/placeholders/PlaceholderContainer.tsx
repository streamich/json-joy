import * as React from 'react';
import {Link} from 'react-router-lite';
import {rule} from 'nano-theme';

const blockClass = rule({
  d: 'block',
  bdb: '0 !important',
  op: 0.5,
  lh: '10px',
  mar: '.8em 0 0',
  '&:hover': {
    op: 1,
    bdb: '0 !important',
  },
});

interface Props {
  to: string;
  children?: React.ReactNode;
}

const PlaceholderContainer: React.FC<Props> = ({to, children}) => {
  return (
    <Link a className={blockClass} to={to}>
      {children}
    </Link>
  );
};

export default PlaceholderContainer;
