import * as React from 'react';
import {rule} from 'nano-theme';
import {useFocused, useReadOnly, useSelected, type RenderElementProps} from 'slate-react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {BasicButtonMore} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonMore';
import {Popup} from '@jsonjoy.com/ui/lib/4-card/Popup';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useMuTxt} from '../../../context';
import {FileOptionsPopup} from './FileOptionsPopup';
import {formatFileSize, isAudioMime, isImageMime, isVideoMime} from './settings';
import type {FileElement as FileElementType, FileThing} from '../../../types';

const blockClass = rule({
  pos: 'relative',
  pb: '12px',
  bxz: 'border-box',
});

const cardClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '12px',
  pd: '12px 16px',
  bxz: 'border-box',
  us: 'none',
});

const iconBoxClass = rule({
  fls: '0 0 auto',
  d: 'flex',
  ai: 'center',
  jc: 'center',
  w: '40px',
  h: '40px',
  bdrad: '8px',
});

const metaClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '2px',
  minW: 0,
  fl: '1 1 auto',
});

const nameClass = rule({
  fz: '14px',
  fw: 600,
  ws: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
});

const subClass = rule({
  fz: '12px',
  lh: 1.4,
  ws: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
});

const captionClass = rule({
  textAlign: 'center',
  fz: '13px',
  lh: 1.4,
  mt: '6px',
});

const moreWrapClass = rule({
  pos: 'absolute',
  t: '8px',
  r: '-32px',
  trs: 'opacity .2s',
});

const previewImgClass = rule({
  display: 'block',
  maxW: '100%',
  maxH: '480px',
  bdrad: '6px',
  bxz: 'border-box',
});

const previewMediaClass = rule({
  display: 'block',
  w: '100%',
  bdrad: '6px',
  bxz: 'border-box',
});

const useObjectUrl = (data: Uint8Array | undefined, mime: string | undefined): string | null => {
  return React.useMemo(() => {
    if (!data || !data.length) return null;
    try {
      const blob = new Blob([data as BlobPart], {type: mime || 'application/octet-stream'});
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, [data, mime]);
};

const useRevokeOnUnmount = (url: string | null): void => {
  React.useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);
};

const BrokenFileCard: React.FC<{thingId: string; selected: boolean}> = ({thingId, selected}) => {
  const styles = useStyles();
  return (
    <Paper
      noOutline
      style={{
        outline: '2px solid ' + (selected ? '#07f' : 'transparent'),
        outlineOffset: 2,
      }}
    >
      <div className={cardClass}>
        <div
          className={iconBoxClass}
          style={{background: styles.g(0.92, 0.4)}}
        >
          <Iconista set={'lucide' as any} icon={'file-warning' as any} width={20} height={20} />
        </div>
        <div className={metaClass}>
          <div className={nameClass}>Missing file</div>
          <div className={subClass} style={{color: styles.g(0.4)}}>
            Reference {thingId} could not be resolved
          </div>
        </div>
      </div>
    </Paper>
  );
};

interface ResolvedFileCardProps {
  thing: FileThing;
  caption?: string;
  selected: boolean;
}

const ResolvedFileCard: React.FC<ResolvedFileCardProps> = ({thing, caption, selected}) => {
  const styles = useStyles();
  const url = useObjectUrl(thing.data, thing.mimeType);
  useRevokeOnUnmount(url);

  const isImg = isImageMime(thing.mimeType);
  const isAud = isAudioMime(thing.mimeType);
  const isVid = isVideoMime(thing.mimeType);

  let body: React.ReactNode;
  if (isImg && url) {
    body = (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <img className={previewImgClass} src={url} alt={thing.name || 'image'} />
      </div>
    );
  } else if (isVid && url) {
    body = <video className={previewMediaClass} src={url} controls />;
  } else if (isAud && url) {
    body = <audio className={previewMediaClass} src={url} controls />;
  } else {
    body = (
      <div className={cardClass}>
        <div
          className={iconBoxClass}
          style={{background: styles.g(0.92, 0.4)}}
        >
          <Iconista set={'lucide' as any} icon={'file' as any} width={20} height={20} />
        </div>
        <div className={metaClass}>
          <div className={nameClass}>{thing.name || 'Untitled file'}</div>
          <div className={subClass} style={{color: styles.g(0.4)}}>
            {[thing.mimeType, formatFileSize(thing.size)].filter(Boolean).join(' • ')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Paper
      noOutline
      style={{
        margin: '4px 0',
        overflow: 'hidden',
        outline: '2px solid ' + (selected ? '#07f' : 'transparent'),
        outlineOffset: 2,
      }}
    >
      <div style={{padding: 12}}>{body}</div>
      {caption ? (
        <div className={captionClass} style={{color: styles.g(0.42)}}>
          {caption}
        </div>
      ) : null}
    </Paper>
  );
};

export interface FileElementProps extends RenderElementProps {
  element: FileElementType;
}

export const FileElement: React.FC<FileElementProps> = ({attributes, children, element}) => {
  const mutxt = useMuTxt();
  mutxt.things.version.use();
  const readOnly = useReadOnly();
  const isSelected = useSelected();
  const isFocused = useFocused();
  const selected = isSelected && isFocused;

  const thingId = element['@thing'];
  const thing = thingId ? (mutxt.things.get(thingId) as FileThing | null) : null;

  return (
    <div {...attributes} className={blockClass}>
      <div contentEditable={false}>
        {thing ? (
          <ResolvedFileCard thing={thing} caption={element.caption} selected={selected} />
        ) : (
          <BrokenFileCard thingId={thingId} selected={selected} />
        )}
      </div>
      {!readOnly && (
        <span
          contentEditable={false}
          className={moreWrapClass}
          style={{opacity: selected ? 1 : 0, pointerEvents: selected ? 'auto' : 'none'}}
        >
          <Popup renderContext={() => <FileOptionsPopup element={element} />}>
            <BasicButtonMore
              type="button"
              width={24}
              height={24}
              rounder
              tooltip="File options"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />
          </Popup>
        </span>
      )}
      {children}
    </div>
  );
};
