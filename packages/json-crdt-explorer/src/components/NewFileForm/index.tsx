import * as React from 'react';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {DropArea} from '../DropArea';
import {useExplorer} from '../../context';
import {CreateButton} from '@jsonjoy.com/collaborative-ui/lib//molecules/CreateButton';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {TraceSelector} from '../TraceSelector';
import {Text} from '@jsonjoy.com/ui/lib/1-inline/Text';
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
    <div onClick={(e) => e.stopPropagation()} onKeyDown={() => {}}>
      <div>
        <MiniTitle>{t('New')}</MiniTitle>
        <Space size={-1} />
        <Flex style={{alignItems: 'center'}}>
          <CreateButton
            radius={1}
            primary
            colorStep={'el-1'}
            block
            fill
            size={expanded ? 1 : -1}
            onClick={() => state.createNew({})}
          >
            {t('Create JSON object')}
          </CreateButton>
          <Space horizontal />
          <Popup renderContext={() => <ContextMenu inset menu={state.menus.newFileMenu()} />}>
            <BasicButtonMore size={32} rounder fill />
          </Popup>
        </Flex>
      </div>

      <Space size={expanded ? 4 : 1} />

      <div>
        <MiniTitle>File</MiniTitle>
        <Space size={-1} />
        <DropArea compact={!expanded} />
      </div>

      <Space size={expanded ? 4 : 1} />

      <div>
        <MiniTitle>{t('Traces')}</MiniTitle>
        <p style={{marginTop: 8}}>
          <Text size={-2}>
            {expanded
              ? t(
                  'Load a trace to get started. Traces are pre-recorded editing sessions that you can replay and explore.',
                )
              : t('Load a trace to get started.')}
          </Text>
        </p>
        <TraceSelector expanded={expanded} />
      </div>
    </div>
  );
};
