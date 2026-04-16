import * as React from 'react';
import {ExplorerMenu} from '../ExplorerMenu';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {useT} from 'use-t';
import {NewFileForm} from '../NewFileForm';
import {AppGridColumn} from '@jsonjoy.com/ui/lib/7-fullscreen/AppGrid';
import {Header} from './Header';

export type LeftSidebarProps = Record<string, never>;

export const LeftSidebar: React.FC<LeftSidebarProps> = () => {
  const [t] = useT();
  const state = useExplorer();
  const files = useBehaviorSubject(state.files$);

  let content: React.ReactNode | undefined;

  if (files.length) {
    content = (
      <div style={{maxWidth: 320, width: '100%', margin: '0 auto'}}>
        {/* <div onClick={(e) => e.stopPropagation()} onKeyDown={() => {}}> */}
        <div style={{padding: '16px 12px 0 16px'}}>
          <MiniTitle>{t('Saved')}</MiniTitle>
          <Space size={-1} />
          <ExplorerMenu />
        </div>

        <Space size={6} />
        <Separator />
        <Space size={4} />
          
          
          <div style={{padding: '0 12px 16px 16px'}}>
            <NewFileForm />
          </div>
        {/* </div> */}
      </div>
    );
  }

  return (
    <AppGridColumn header={<Header />} footer={<div>{' '}</div>} scrollRailWidth={4}>
      {content}
    </AppGridColumn>
  );
};
