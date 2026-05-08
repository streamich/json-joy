import * as React from 'react';
import {CopyCode} from '@jsonjoy.com/ui/lib/1-inline/CopyCode';
import {TwoColFormRow} from '@jsonjoy.com/ui/lib/3-list-item/TwoColForm';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {DateTime} from '@jsonjoy.com/ui/lib/1-inline/DateTime';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../../context';
import type {FileMetadataDto, OpenFile} from '../../../state/file';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import BasicButton from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {useT} from 'use-t';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Bytes} from '@jsonjoy.com/ui/src/1-inline/Bytes';

const HPAD = 22;

const NameValueOpen: React.FC<{file: FileMetadataDto; openFile: OpenFile}> = ({file, openFile}) => {
  const liveName = openFile.name.use();
  const value = liveName ?? file.name;
  const state = useExplorer();
  const focusValueRef = React.useRef<string>(value);

  return (
    <Input
      ghost="hint"
      align="right"
      size={-3}
      value={value}
      onFocus={() => {
        focusValueRef.current = value;
      }}
      onChange={(next) => state.renameFile(openFile, next)}
      onEnter={(e) => (e.currentTarget as HTMLInputElement).blur()}
      onEsc={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        state.renameFile(openFile, focusValueRef.current);
        (e.currentTarget as HTMLInputElement).blur();
      }}
    />
  );
};

const NameValueClosed: React.FC<{file: FileMetadataDto}> = ({file}) => {
  const state = useExplorer();
  const [value, setValue] = React.useState<string>(file.name);
  const focusValueRef = React.useRef<string>(file.name);

  React.useEffect(() => {
    setValue(file.name);
  }, [file.name]);

  const commit = React.useCallback(
    (next: string) => {
      if (next === file.name) return;
      void state.rename(file.id, next);
    },
    [state, file.id, file.name],
  );

  return (
    <Input
      ghost="hint"
      align="right"
      size={-3}
      value={value}
      onFocus={() => {
        focusValueRef.current = value;
      }}
      onChange={setValue}
      onBlur={() => commit(value)}
      onEnter={(e) => (e.currentTarget as HTMLInputElement).blur()}
      onEsc={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        setValue(focusValueRef.current);
        (e.currentTarget as HTMLInputElement).blur();
      }}
    />
  );
};

const NameValue: React.FC<{file: FileMetadataDto; openFile?: OpenFile}> = ({file, openFile}) => {
  if (openFile) return <NameValueOpen file={file} openFile={openFile} />;
  return <NameValueClosed file={file} />;
};

const Section: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{padding: `0 ${HPAD}px`, boxSizing: 'border-box'}}>{children}</div>
);

export interface FileOptionsFormProps {
  file: FileMetadataDto;
}

export const FileOptionsForm: React.FC<FileOptionsFormProps> = ({file}) => {
  const [t] = useT();
  const styles = useStyles();
  const state = useExplorer();
  const openFiles = useBehaviorSubject(state.files$);
  const openFile = openFiles.find((f) => f.id === file.id);
  const isOpen = !!openFile;

  const handleDownload = React.useCallback(() => {
    state.download(file.id).catch(() => {});
  }, [state, file.id]);

  const handleDelete = React.useCallback(async () => {
    await state.deleteSaved(file.id);
  }, [state, file.id]);

  return (
    <div style={{padding: '8px 0', boxSizing: 'border-box'}}>
      <Section>
        <MiniTitle contrast>{t('File')}</MiniTitle>
        <Space size={-3} />
        <TwoColFormRow
          small
          compact
          icon={<Iconista set="bootstrap" icon="file-earmark-binary" width={16} height={16} />}
          title={t('Name')}
        >
          <NameValue file={file} openFile={openFile} />
        </TwoColFormRow>
        <TwoColFormRow
          small
          compact
          icon={<Iconista set="bootstrap" icon="hash" width={16} height={16} />}
          title="ID"
        >
          <CopyCode size={-1} alt roundest noBg value={file.id} />
        </TwoColFormRow>
      </Section>

      <Space size={0} />
      <Separator />
      <Space size={0} />

      <Section>
        <MiniTitle contrast>{t('Metadata')}</MiniTitle>
        <Space size={-3} />
        <TwoColFormRow
          small
          compact
          icon={<Iconista set="bootstrap" icon="clock" width={16} height={16} />}
          title={t('Created')}
        >
          <DateTime value={file.createdAt} />
        </TwoColFormRow>
        <TwoColFormRow
          small
          compact
          icon={<Iconista set="bootstrap" icon="clock" width={16} height={16} />}
          title={t('Updated')}
        >
          <DateTime value={file.updatedAt} />
        </TwoColFormRow>
        {!!openFile?.size && (
          <TwoColFormRow
            small
            compact
            icon={<Iconista set="bootstrap" icon="file-earmark" width={16} height={16} />}
            title={t('Size')}
          >
            <Bytes value={openFile?.size ?? 0} />
          </TwoColFormRow>
        )}
      </Section>

      <Space size={0} />
      <Separator />
      <Space size={0} />

      <Section>
        <MiniTitle contrast>{t('Actions')}</MiniTitle>
        <Space size={-3} />
        <TwoColFormRow
          small
          compact
          icon={<Iconista set="auth0" icon="download" width={16} height={16} />}
          title={t('Create a copy')}
        >
          <BasicButton width={'auto'} height={28} fill onClick={handleDownload}>
            <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
              <Iconista set="auth0" icon="download" width={16} height={16} />
              {t('Download')}
            </span>
          </BasicButton>
        </TwoColFormRow>
      </Section>

      <Space size={0} />
      <Separator hard />
      <Space size={0} />

      <Section>
        <MiniTitle>
          <span style={{color: styles.col.get('error')}}>{t('Danger zone')}</span>
        </MiniTitle>
        <Space size={-3} />
        <TwoColFormRow small compact>
          <Popup
            renderContext={({onEsc}) => (
              <ContextMenu
                inset
                onEsc={onEsc}
                menu={{
                  name: t('Confirm delete'),
                  minWidth: 240,
                  children: [
                    {name: t('Cancel'), onSelect: () => {}},
                    {
                      name: t('Delete'),
                      onSelect: handleDelete,
                      danger: true,
                      right: () => <Sidetip small>{t('Are you sure?')}</Sidetip>,
                    },
                  ],
                }}
              />
            )}
          >
            <BasicButton width={'auto'} height={28} fill color="red">
              <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
                <Iconista
                  set="bootstrap"
                  icon="trash2"
                  width={16}
                  height={16}
                  style={{color: styles.col.get('error')}}
                />
                <span style={{color: styles.col.get('error')}}>{t('Delete permanently')}</span>
              </span>
            </BasicButton>
          </Popup>
        </TwoColFormRow>
      </Section>
    </div>
  );
};
