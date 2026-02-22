import * as React from 'react';
import {rule} from 'nano-theme';

const fixedClass = rule({
  flex: '0 0',
});

const contentClass = rule({
  d: 'flex',
  flex: '1 1 100%',
});

interface Props {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  separator?: React.ReactNode;
  children: React.ReactNode;
}

export const HeaderFooter: React.FC<Props> = ({header, footer, separator, children}) => {
  const sep = !!separator && <div className={fixedClass}>{separator}</div>;

  return (
    <>
      <div className={fixedClass}>{header}</div>
      {sep}
      <div className={contentClass}>{children}</div>
      {sep}
      <div className={fixedClass}>{footer}</div>
    </>
  );
};
