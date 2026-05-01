import * as React from 'react';
import {rule} from 'nano-theme';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import {FileListItem} from '@jsonjoy.com/ui/lib/3-list-item/FileListItem';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {FlexibleInput} from 'flexible-input';
import {MediaPreview, type MediaKind} from './MediaPreview';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {Button} from '@jsonjoy.com/ui/lib/2-inline-block/Button';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {FileOptionsPopup} from './FileOptionsPopup';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Transforms} from 'slate';
import {useReadOnly, ReactEditor} from 'slate-react';
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

const bindVoidInputKeyDown = (el: HTMLElement | null, editor: ReactEditor, onCancel?: () => void): (() => void) => {
  if (!el) return () => {};
  const handler: EventListener = (evt: Event) => {
    const e = evt as KeyboardEvent;
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      (e.target as HTMLElement).blur();
      requestAnimationFrame(() => ReactEditor.focus(editor));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
      (e.target as HTMLElement).blur();
      requestAnimationFrame(() => ReactEditor.focus(editor));
    }
  };
  el.addEventListener('keydown', handler);
  return () => el.removeEventListener('keydown', handler);
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

  const [nameValue, setNameValue] = React.useState(thing.name ?? '');
  const focused = React.useRef(false);
  React.useEffect(() => {
    if (!focused.current) setNameValue(thing.name ?? '');
  }, [thing.name]);

  const commitName = () => {
    focused.current = false;
    const obj = mutxt.things.obj.obj(thing['@id'], true);
    obj?.mergeKeys({name: nameValue.trim() || undefined});
  };

  const [nameInputEl, setNameInputEl] = React.useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  React.useEffect(() => {
    if (readOnly) return;
    return bindVoidInputKeyDown(nameInputEl, mutxt.editor, () => {
      setNameValue(thing.name ?? '');
      focused.current = false;
    });
  }, [nameInputEl, readOnly, thing.name]);

  const [captionValue, setCaptionValue] = React.useState(element.caption ?? '');
  const captionFocused = React.useRef(false);
  React.useEffect(() => {
    if (!captionFocused.current) setCaptionValue(element.caption ?? '');
  }, [element.caption]);

  const commitCaption = () => {
    captionFocused.current = false;
    const editor = mutxt.editor;
    const path = ReactEditor.findPath(editor, element);
    const next = captionValue.trim();
    if (next) Transforms.setNodes(editor, {caption: next} as Partial<FileElementType>, {at: path});
    else Transforms.unsetNodes(editor, 'caption', {at: path});
  };

  const captionRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (readOnly) return;
    return bindVoidInputKeyDown(captionRef.current, mutxt.editor, () => {
      setCaptionValue(element.caption ?? '');
      captionFocused.current = false;
    });
  }, [readOnly, element.caption]);

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
      title={readOnly ? (thing.name || t('Untitled file')) : (
        <FlexibleInput
          inp={setNameInputEl}
          value={nameValue}
          minWidth={120}
          onChange={(e) => setNameValue(e.target.value)}
          onFocus={() => { focused.current = true; }}
          onBlur={commitName}
        />
      )}
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
      {(element.caption || !readOnly) ? (
        <div ref={captionRef} contentEditable={false} className={captionClass} style={{color: styles.g(0.42), padding: '8px 8px 4px'}}>
          {readOnly ? element.caption : (
            <FlexibleInput
              value={captionValue}
              minWidth={80}
              typeahead={captionValue ? '' : t('Add caption…')}
              onChange={(e) => setCaptionValue(e.target.value)}
              onFocus={() => { captionFocused.current = true; }}
              onBlur={commitCaption}
            />
          )}
        </div>
      ) : null}
    </Paper>
  );
};
