import * as React from 'react';
import {ExplorerMenu} from '../ExplorerMenu';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {DropArea} from '../DropArea';
import {useExplorer} from '../context';
import {CreateButton} from '@jsonjoy.com/collaborative-ui/lib//molecules/CreateButton';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {NiceUiSizes} from '@jsonjoy.com/ui/lib/constants';
import {TraceSelector} from '../TraceSelector';
import {Text} from '@jsonjoy.com/ui/lib/1-inline/Text';
import {useT} from 'use-t';

export type ExplorerSidenavProps = Record<string, never>;

export const ExplorerSidenav: React.FC<ExplorerSidenavProps> = () => {
  const [t] = useT();
  const state = useExplorer();
  const files = useBehaviorSubject(state.files$);

  const expanded = !files.length;
  const width = expanded ? NiceUiSizes.SidebarWidth + 100 : NiceUiSizes.SidebarWidth;

  return (
    <div style={{display: 'flex', maxWidth: 360, width: '100%', alignItems: 'center', flexDirection: 'column'}}>
      <div style={{width}} onClick={(e) => e.stopPropagation()} onKeyDown={() => {}}>
        {expanded && (
          <Text
            as={'h6'}
            font="sans"
            style={{textAlign: 'center', margin: '16px 0 0', opacity: 0.55, lineHeight: '1.5em', fontSize: '15px'}}
          >
            JSON CRDT playground · Explore JSON CRDT documents state and patches · Save, load documents in various
            formats · Time travel and debug document internal state
          </Text>
        )}
        <div style={{width}}>
          {!expanded && (
            <>
              <MiniTitle>{t('Open')}</MiniTitle>
              <Space size={-1} />
              <ExplorerMenu />
              <Space size={6} />
              <Separator hard />
              <Space size={4} />
            </>
          )}
        </div>

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
