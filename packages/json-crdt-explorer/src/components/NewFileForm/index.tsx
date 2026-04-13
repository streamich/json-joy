import * as React from 'react';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {DropArea} from '../DropArea';
import {useExplorer} from '../../context';
import {CreateButton} from '@jsonjoy.com/collaborative-ui/lib//molecules/CreateButton';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {NiceUiSizes} from '@jsonjoy.com/ui/lib/constants';
import {TraceSelector} from '../TraceSelector';
import {Text} from '@jsonjoy.com/ui/lib/1-inline/Text';
import {useT} from 'use-t';

export interface NewFileFormProps {
  expanded?: boolean;
}

export const NewFileForm: React.FC<NewFileFormProps> = ({expanded}) => {
  const [t] = useT();
  const state = useExplorer();
  const files = useBehaviorSubject(state.files$);

  const width = expanded ? NiceUiSizes.SidebarWidth + 100 : NiceUiSizes.SidebarWidth;

  return (
    <div style={{display: 'flex', maxWidth: 360, width: '100%', alignItems: 'center', flexDirection: 'column'}}>
      <div style={{width}} onClick={(e) => e.stopPropagation()} onKeyDown={() => {}}>
        <div style={{width, paddingTop: expanded ? 64 : 0}}>
          <MiniTitle>{t('New')}</MiniTitle>
          <Space size={-1} />
          <CreateButton
            radius={1}
            primary
            colorStep={'el-1'}
            block
            fill
            size={expanded ? 1 : 0}
            onClick={() => state.createNew()}
          >
            Create
          </CreateButton>
        </div>

        <Space size={expanded ? 4 : 2} />

        <div style={{width}}>
          <MiniTitle>File</MiniTitle>
          <Space size={-1} />
          <DropArea />
        </div>

        <Space size={expanded ? 4 : 2} />

        <div style={{width}}>
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
          <TraceSelector expanded={expanded} width={width} />
        </div>
      </div>
    </div>
  );
};
