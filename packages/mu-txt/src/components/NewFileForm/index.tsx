import * as React from 'react';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {DropArea} from '../DropArea';
import {useExplorer} from '../../context';
import {CreateButton} from '@jsonjoy.com/collaborative-ui/lib/molecules/CreateButton';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {useT} from 'use-t';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';

export interface NewFileFormProps {
  expanded?: boolean;
}

export const NewFileForm: React.FC<NewFileFormProps> = ({expanded}) => {
  const [t] = useT();
  const state = useExplorer();

  return (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={() => {}} style={{maxWidth: 360, margin: '0 auto'}}>
      <div>
        {!!expanded && <MiniTitle>{t('New')}</MiniTitle>}
        <Space size={-1} />
        <Flex style={{alignItems: 'center'}}>
          <CreateButton
            radius={1}
            colorStep={'el-1'}
            block
            ghost
            size={expanded ? 1 : -1}
            onClick={() => state.createNewMuTxt()}
          >
            {t('New document')}
          </CreateButton>
          <Space horizontal />
          <Popup
            renderContext={() => <ContextMenu inset showSearch menu={state.menus.newFileMenu()} />}
            tooltip={{renderTooltip: () => t('From template'), nowrap: true}}
          >
            <BasicButtonMore size={32} rounder fill />
          </Popup>
        </Flex>
      </div>
      {!!expanded && (
        <>
          <Space size={expanded ? 4 : 1} />
          <div>
            <MiniTitle>Open</MiniTitle>
            <Space size={-1} />
            <DropArea compact={!expanded} />
          </div>
        </>
      )}
    </div>
  );
};
