import * as React from 'react';
import {rule, useRule} from 'nano-theme';
import {Dot} from '@jsonjoy.com/ui/lib/1-inline/Dot';
import {Pill} from '@jsonjoy.com/ui/lib/1-inline/Pill';
import {CopyCode} from '@jsonjoy.com/ui/lib/1-inline/CopyCode';
import {OverlayDrawer} from '@jsonjoy.com/ui/lib/5-block/Drawer';
import {DrawerBody} from '@jsonjoy.com/ui/lib/5-block/Drawer/components/DrawerBody';
import {
  TwoColFormRow,
} from '@jsonjoy.com/ui/lib/3-list-item/TwoColForm';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {ContextMenu} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {DateTime} from '@jsonjoy.com/ui/lib/1-inline/DateTime';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../../context';
import type {FileMetadataDto, OpenFile} from '../../../state/file';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import {Separator} from '@jsonjoy.com/ui/lib/3-list-item/Separator';
import BasicButton from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {Space} from '@jsonjoy.com/ui/lib/3-list-item/Space';
import {MiniTitle} from '@jsonjoy.com/ui/lib/3-list-item/MiniTitle';
import {useT} from 'use-t';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Bytes} from '@jsonjoy.com/ui/src/1-inline/Bytes';

const nameInputClass = rule({
  d: 'block',
  w: '100%',
  minWidth: 0,
  bxz: 'border-box',
  bg: 'transparent',
  bd: 0,
  out: 0,
  pd: '4px 8px',
  fz: '14px',
  lh: '20px',
  ff: 'inherit',
  ta: 'right',
  bdrad: '6px',
  trs: 'background .15s ease, box-shadow .15s ease',
});

const NameValue: React.FC<{file: FileMetadataDto; openFile?: OpenFile}> = ({file, openFile}) => {
  const liveName = openFile?.name.use();
  const value = liveName ?? file.name;
  const state = useExplorer();
  const focusValueRef = React.useRef<string>(value);

  const dynamicInputClass = useRule((t) => ({
    col: t.g(0.15),
    '&:hover': {bg: t.g(0, 0.04)},
    '&:focus': {bg: t.g(0, 0.06), bxsh: `inset 0 0 0 1px ${t.g(0, 0.18)}`},
  }));

  if (!openFile) {
    return <span>{value}</span>;
  }

  return (
    <input
      className={nameInputClass + dynamicInputClass}
      value={value}
      onFocus={() => {
        focusValueRef.current = value;
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          (e.currentTarget as HTMLInputElement).blur();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          state.renameFile(openFile, focusValueRef.current);
          (e.currentTarget as HTMLInputElement).blur();
        }
      }}
      onChange={(e) => state.renameFile(openFile, e.target.value)}
    />
  );
};

export interface FileOptionsDrawerProps {
  file: FileMetadataDto;
  open: boolean;
  onClose: () => void;
}

export const FileOptionsDrawer: React.FC<FileOptionsDrawerProps> = ({file, open, onClose}) => {
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
    onClose();
    await state.deleteSaved(file.id);
  }, [state, file.id, onClose]);

  return (
    <OverlayDrawer
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      side="right"
      width={Math.min(580, window.innerWidth * 0.9)}
      aria-label="File options"
    >
      <DrawerBody>
        <div style={{margin: '0 -16px 8px', padding: '0px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box', borderBottom: '1px solid rgba(127,127,127,.1)'}}>
          <BasicButtonClose size={32} round onClick={onClose} />
        </div>
        
        <div style={{padding: '16px', boxSizing: 'border-box', maxWidth: 480, margin: '0 auto'}}>
          <MiniTitle contrast>{t('File')}</MiniTitle>
          <Space size={-2} />
          <TwoColFormRow
            icon={<Iconista set="bootstrap" icon="file-earmark-binary" width={16} height={16} />}
            title={t('Name')}
          >
            <NameValue file={file} openFile={openFile} />
          </TwoColFormRow>
          <TwoColFormRow icon={<Iconista set="bootstrap" icon="hash" width={16} height={16} />} title="ID">
            <CopyCode size={-1} alt roundest noBg value={file.id} />
          </TwoColFormRow>
          <TwoColFormRow icon={<Iconista set="bootstrap" icon="info-circle" width={16} height={16} />} title={t('State')}>
            {isOpen ? <Pill color={'positive'}><Dot color={'positive'} />{t('Open')}</Pill> : <Pill>{t('Closed')}</Pill>}
          </TwoColFormRow>

          <Space size={2} />
          <Separator />
          <Space size={2} />

          <MiniTitle contrast>{t('Dates')}</MiniTitle>
          <Space size={-2} />
          <TwoColFormRow icon={<Iconista set="bootstrap" icon="clock" width={16} height={16} />} title={t('Created')}>
            <DateTime value={file.createdAt} />
          </TwoColFormRow>
          <TwoColFormRow icon={<Iconista set="bootstrap" icon="clock" width={16} height={16} />} title={t('Updated')}>
            <DateTime value={file.updatedAt} />
          </TwoColFormRow>
          {!!openFile?.size && (
            <TwoColFormRow icon={<Iconista set="bootstrap" icon="file-earmark" width={16} height={16} />} title={t('Size')}>
              <Bytes value={openFile?.size ?? 0} />
            </TwoColFormRow>
          )}


          <Space size={2} />
          <Separator />
          <Space size={2} />

          <MiniTitle contrast>{t('Actions')}</MiniTitle>
          <Space size={-2} />
          <TwoColFormRow
            icon={<Iconista set="auth0" icon="download" width={16} height={16} />}
            title={t('Create a copy')}
          >
            <BasicButton width={'auto'} height={32} fill onClick={handleDownload}>
              <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
                <Iconista set="auth0" icon="download" width={16} height={16} />
                {t('Download')}
              </span>
            </BasicButton>
          </TwoColFormRow>


          <Space size={2} />
          <Separator />
          <Space size={2} />

          <MiniTitle contrast>{t('Danger zone')}</MiniTitle>
          <Space size={-2} />
          <TwoColFormRow>
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
              <BasicButton width={'auto'} height={32} fill color="red">
                <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
                  <Iconista set="bootstrap" icon="trash2" width={16} height={16} style={{color: styles.col.get('error')}} />
                  <span style={{color: styles.col.get('error')}}>
                    {t('Delete permanently')}
                  </span>
                </span>
              </BasicButton>
            </Popup>
          </TwoColFormRow>
        </div>
      </DrawerBody>
    </OverlayDrawer>
  );
};
