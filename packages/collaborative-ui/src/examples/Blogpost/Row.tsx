import * as React from 'react';
import {rule} from 'nano-theme';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';

const css = {
  row: rule({
    w: '100%',
    maxW: '100%',
    pd: '16px 16px 0',
    bxz: 'border-box',
  }),
};

export interface RowProps {
  title?: React.ReactNode;
  children: React.ReactNode;
}

export const Row: React.FC<RowProps> = ({title, children}) => {
  return (
    <div className={css.row}>
      {!!title && (
        <>
          <Code gray noBg size={-1}>
            {title}
          </Code>
          <Space size={-2} />
        </>
      )}
      {children}
    </div>
  );
};
