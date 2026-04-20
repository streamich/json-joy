import * as React from 'react';
import {rule} from 'nano-theme';
import Embed from 'react-embed';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {Placeholder} from '@jsonjoy.com/ui/lib/3-list-item/Placeholder';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useFocused, useSelected, type RenderElementProps} from 'slate-react';
import {Favicon} from '@jsonjoy.com/ui/lib/1-inline/Favicon';
import type {EmbedElement as EmbedElementType} from '../../types';

const blockClass = rule({
  pos: 'relative',
  pb: '18px',
  bxz: 'border-box',
});

const previewClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '10px',
});

const getEmbedHost = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'external content';
  }
};

const EmbedFallback: React.FC<{url: string}> = ({url}) => {
  const styles = useStyles();
  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      style={{
        display: 'flex',
        boxSizing: 'border-box',
        borderRadius: 8,
        margin: -16,
        padding: 16,
        border: '1px solid ' + styles.g(0.86),
        flexDirection: 'column',
        gap: '4px',
        textDecoration: 'none',
        color: styles.light ? styles.g(0.16) : styles.g(0.9),
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600}}>
        <Favicon url={url} size={16} />
        <span>{getEmbedHost(url)}</span>
      </div>
      <div
        style={{
          fontSize: '13px',
          lineHeight: 1.45,
          color: styles.light ? styles.g(0.36) : styles.g(0.66),
          wordBreak: 'break-all',
        }}
      >
        {url}
      </div>
    </a>
  );
};

export interface EmbedPreviewProps {
  url: string;
  caption?: string;
  compact?: boolean;
  selected?: boolean;
  width?: number;
}

export const EmbedPreview: React.FC<EmbedPreviewProps> = ({url, caption, compact, selected, width = 720}) => {
  const styles = useStyles();

  return (
    <div className={previewClass}>
      <Paper
      noOutline
      style={{
        margin: '4px 0',
        overflow: 'hidden',
        outline: '2px solid ' + (selected ? '#07f' : 'transparent'),
        outlineOffset: 4,
      }}
      >
        <div style={{padding: compact ? 12 : 16}}>
          <Embed
            url={url}
            width={width}
            isDark={!styles.light}
            fallback={<Placeholder />}
            renderVoid={() => <EmbedFallback url={url} />}
          />
        </div>
      </Paper>
      {!!caption && (
        <div
          style={{
            textAlign: 'center',
            fontSize: '13px',
            lineHeight: 1.4,
            color: styles.g(0.42),
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};

export interface EmbedElementProps extends RenderElementProps {
  element: EmbedElementType;
}

export const EmbedElement: React.FC<EmbedElementProps> = ({attributes, children, element}) => {
  const isSelected = useSelected();
  const isFocused = useFocused();
  const selected = isSelected && isFocused;

  return (
    <div {...attributes} className={blockClass}>
      <div contentEditable={false}>
        <EmbedPreview
          url={element.url}
          width={element.width ?? 720}
          caption={element.caption}
          selected={selected}
        />
      </div>
      {children}
    </div>
  );
};