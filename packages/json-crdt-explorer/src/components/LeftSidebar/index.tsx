import * as React from 'react';
import {SavedFileList} from '../SavedFileList';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import {useT} from 'use-t';
import {NewFileForm} from '../NewFileForm';
import {AppGridColumn} from '@jsonjoy.com/ui/lib/7-fullscreen/AppGrid';
import {Header} from './Header';

export interface LeftSidebarProps {
  toggle: React.ReactNode;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({toggle}) => {
  const [t] = useT();
  const state = useExplorer();
  const files = useBehaviorSubject(state.files$);

  let content: React.ReactNode | undefined;

  return (
    <AppGridColumn
      header={<Header toggle={toggle} />}
      footer={
        !!files.length && (
          <div style={{padding: 16, margin: '0 auto'}}>
            <NewFileForm />
          </div>
        )
      }
      scrollRailWidth={4}
    >
      <div style={{maxWidth: 320, width: '100%', margin: '0 auto'}}>
        <div style={{padding: '16px 8px 16px 12px'}}>
          <SavedFileList />
        </div>
      </div>
    </AppGridColumn>
  );
};
