import * as React from 'react';
import {makeRule} from 'nano-theme';

const useTableClass = makeRule((theme) => ({
  '& tr th': {
    bdb: `1px solid ${theme.g(0.1, 0.08)}`,
  },
  '& tr td': {
    bdb: `1px solid ${theme.g(0.1, 0.08)}`,
  },
  '& tr:last-child td': {
    bdb: '0',
  },
}));

export interface MyTableProps {
  className?: string;
  children?: React.ReactNode;
}

export const MyTable: React.FC<MyTableProps> = ({className, children}) => {
  const dynamicTableClass = useTableClass();

  return <table className={className + dynamicTableClass}>{children}</table>;
};
