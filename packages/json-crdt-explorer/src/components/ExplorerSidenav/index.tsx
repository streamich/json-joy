import * as React from 'react';
import {ExplorerMenu} from '../ExplorerMenu';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {useT} from 'use-t';
import {NewFileForm} from '../NewFileForm';

export type ExplorerSidenavProps = Record<string, never>;

export const ExplorerSidenav: React.FC<ExplorerSidenavProps> = () => {
  const [t] = useT();
  const state = useExplorer();
  const files = useBehaviorSubject(state.files$);

  if (!files.length) return null;

  return (
    <div style={{maxWidth: 320, width: '100%', margin: '0 auto'}}>
      {/* <div onClick={(e) => e.stopPropagation()} onKeyDown={() => {}}> */}
      <div style={{padding: '16px 12px 0 16px'}}>
        <MiniTitle>{t('Open')}</MiniTitle>
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
};
