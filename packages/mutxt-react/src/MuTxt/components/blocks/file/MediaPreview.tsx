import * as React from 'react';
import {rule} from 'nano-theme';
import {useObjectUrl} from './useObjectUrl';
import type {FileThing} from '../../../types';

const imgClass = rule({
  display: 'block',
  maxW: '100%',
  maxH: '480px',
  bdrad: '6px',
  bxz: 'border-box',
});

const mediaClass = rule({
  display: 'block',
  w: '100%',
  bdrad: '6px',
  bxz: 'border-box',
});

export type MediaKind = 'image' | 'video' | 'audio';

export interface MediaPreviewProps {
  thing: FileThing;
  kind: MediaKind;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({thing, kind}) => {
  const url = useObjectUrl(thing.data, thing.mimeType);
  if (!url) return null;
  if (kind === 'image') {
    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <img className={imgClass} src={url} alt={thing.name || 'image'} />
      </div>
    );
  }
  // biome-ignore lint/a11y/useMediaCaption: caption track is unavailable for user-uploaded media
  if (kind === 'video') return <video className={mediaClass} src={url} controls />;
  // biome-ignore lint/a11y/useMediaCaption: caption track is unavailable for user-uploaded media
  return <audio className={mediaClass} src={url} controls />;
};
