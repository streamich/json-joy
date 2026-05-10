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
    '& tr th': {
      bdb: `1px solid ${styles.g(0.1, 0.08)}`,
    },
    '& tr td': {
      bdb: `1px solid ${styles.g(0.1, 0.08)}`,
    },
    '& tr:last-child td': {
      bdb: '0',
    },
  });

  return <table className={className + cls}>{children}</table>;
};
