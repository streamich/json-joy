import * as React from 'react';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import {useT} from 'use-t';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';

export type HeaderProps = Record<string, never>;

export const Header: React.FC<HeaderProps> = () => {
  const [t] = useT();
  const styles = useStyles();
  const state = useExplorer();
  const files = useBehaviorSubject(state.files$);

  if (!files.length) return null;

  return (
    <Split style={{alignItems: 'center', padding: '0 0 0 8px'}}>
      {/* <h5>{t('Files')}</h5> */}
      <MiniTitle contrast>{t('Files')}</MiniTitle>
      <BasicButtonMore size={32} rounder></BasicButtonMore>
    </Split>
  );
};
