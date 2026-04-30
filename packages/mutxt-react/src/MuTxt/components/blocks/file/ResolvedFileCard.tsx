import * as React from 'react';
import {rule} from 'nano-theme';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import {FileListItem} from '@jsonjoy.com/ui/lib/3-list-item/FileListItem';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {MediaPreview, type MediaKind} from './MediaPreview';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {FileOptionsPopup} from './FileOptionsPopup';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {useReadOnly} from 'slate-react';
import {useT} from 'use-t';
import {FileOptionsState} from './state';
import {useMuTxt} from '../../../context';
import type {FileElement as FileElementType, FileThing} from '../../../types';

const captionClass = rule({
  textAlign: 'center',
  fz: '13px',
  lh: 1.4,
  mt: '6px',
});

const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getExtensionLabel = (thing: FileThing): string => {
  if (thing.name) {
    const dot = thing.name.lastIndexOf('.');
    if (dot >= 0 && dot < thing.name.length - 1) return thing.name.slice(dot + 1).toLowerCase();
  }
  if (thing.mimeType) {
    const slash = thing.mimeType.indexOf('/');
    if (slash >= 0) return thing.mimeType.slice(slash + 1).toLowerCase();
  }
  return 'file';
};

const getMediaKind = (mime: string): MediaKind | null => {
  if (/^image\//i.test(mime)) return 'image';
  if (/^video\//i.test(mime)) return 'video';
  if (/^audio\//i.test(mime)) return 'audio';
  return null;
};

const stopMouseDown = (event: React.MouseEvent): void => {
  event.preventDefault();
  event.stopPropagation();
};

export interface ResolvedFileCardProps {
  thing: FileThing;
  selected: boolean;
  element: FileElementType;
}

export const ResolvedFileCard: React.FC<ResolvedFileCardProps> = ({thing, selected, element}) => {
  const [t] = useT();
  const mutxt = useMuTxt();
  const styles = useStyles();
  const readOnly = useReadOnly();
  const mediaKind = getMediaKind(thing.mimeType || '');

  const options = !readOnly && (
    <Popup renderContext={() => <FileOptionsPopup element={element} />}>
      <BasicButtonMore
        type="button"
        width={32}
        height={32}
        rounder
        tooltip={t('File options')}
        onMouseDown={stopMouseDown}
      />
    </Popup>
  );

  const body = mediaKind ? (
    <MediaPreview thing={thing} kind={mediaKind} />
  ) : (
    <FileListItem
      fill
      spacious
      icon={(
        <FileIcon
          label={getExtensionLabel(thing)}
          ext={getExtensionLabel(thing)}
          id={thing['@id']}
          size={32}
        />
      )}
      title={thing.name || t('Untitled file')}
      metadata={[thing.mimeType, formatFileSize(thing.size)].filter(Boolean).join(' • ')}
      actions={(
        <div style={{display: 'flex', gap: 16, paddingRight: 4}}>
          <Button compact size={-1} icon={<Iconista set={'tabler'} icon={'download'} width={16} height={16} />}
            onClick={() => {
              const state = new FileOptionsState(mutxt, element);
              state.download();
            }}
          >
            {t('Download')}
          </Button>
          {options}
        </div>
      )}
    />
  );

  const caption = element.caption;

  return (
    <Paper
      noOutline
      round
      style={{
        margin: '4px 0',
        outline: '2px solid ' + (selected ? '#07f' : 'transparent'),
        outlineOffset: 2,
        position: 'relative',
      }}
    >
      {body}
      {!!mediaKind && selected && (
        <div style={{position: 'absolute', top: 0, right: -46}}>
          {options}
        </div>
      )}
      {caption ? (
        <div contentEditable={false} className={captionClass} style={{color: styles.g(0.42), padding: '8px 8px 4px'}}>
          {caption}
        </div>
      ) : null}
    </Paper>
  );
};
