import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../../styles/context';

const tableClass = drule({});

export interface MyTableProps {
  className?: string;
  children?: React.ReactNode;
}

export const MyTable: React.FC<MyTableProps> = ({className, children}) => {
  const styles = useStyles();
  const cls = tableClass({
    borderCollapse: 'collapse',
    w: '100%',
    '& thead td, & thead th': {
      fontWeight: 600,
      textAlign: 'left',
      pad: '10px 10px',
      bdb: `1px solid ${styles.g(0, 0.18)}`,
      col: styles.g(0.05),
    },
    '& tbody td': {
      pad: '10px 10px',
      bd: 'none',
    },
    '& tbody tr:nth-child(even) td': {
      bg: styles.g(0, 0.02),
    },
  });

  return <table className={className + cls}>{children}</table>;
};
