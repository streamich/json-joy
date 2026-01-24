import * as React from 'react';
import {rule} from 'nano-theme';
import {useT} from 'use-t';
import InlineCard from '../InlineCard';

const contentClass = rule({
  fz: '0.83em',
  lh: '1.42em',
});

export interface Props {
  children: React.ReactNode;
}

const AsideInline: React.FC<Props> = ({children}) => {
  const [t] = useT();

  return (
    <InlineCard title={t('Comment')}>
      <div className={contentClass}>{children}</div>
    </InlineCard>
  );
};

export default AsideInline;
