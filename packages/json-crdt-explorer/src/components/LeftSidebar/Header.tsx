import * as React from 'react';
import {useT} from 'use-t';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';

export interface HeaderProps {
  toggle: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ toggle }) => {
  const [t] = useT();

  return (
    <Split style={{alignItems: 'center', padding: '0 0 0 8px'}}>
      <MiniTitle>{t('Files')}</MiniTitle>
      {toggle}
    </Split>
  );
};
