import * as React from 'react';
import {drule, rule, useTheme} from 'nano-theme';
import {useT} from 'use-t';
import {TimeAgo} from '@jsonjoy.com/ui/lib/1-inline/TimeAgo';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import {useExplorer} from '../../context';
import type {FileMetadataDto} from '../../state/file';

const listClass = rule({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  width: '100%',
});

const itemClass = drule({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'background .12s ease, color .12s ease',
  textAlign: 'left',
  border: '1px solid transparent',
  background: 'transparent',
  width: '100%',
  font: 'inherit',
});

const iconWrapClass = rule({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
});

const nameClass = rule({
  flex: '1 1 auto',
  minWidth: 0,
  fontSize: '13px',
  fontWeight: 500,
  lineHeight: '1.3em',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const metaClass = rule({
  flex: '0 0 auto',
  fontSize: '11px',
  opacity: 0.5,
});

export interface RecentFilesProps {
  files: FileMetadataDto[];
}

export const RecentFiles: React.FC<RecentFilesProps> = ({files}) => {
  const [t] = useT();
  const state = useExplorer();
  const theme = useTheme();

  if (!files.length) return null;

  return (
    <div className={listClass}>
      {files.map((file) => {
        const cls = itemClass({
          color: theme.g(0.18, 0.9),
          '&:hover': {
            background: theme.g(0.94, 0.2),
            borderColor: theme.g(0.86, 0.26),
          },
        });
        return (
          <button
            type="button"
            key={file.id}
            className={cls}
            onClick={() => state.openSaved(file.id).catch(() => {})}
            title={file.name}
          >
            <span className={iconWrapClass}>
              <FileIcon id={file.id} label={file.name} gradient accent size={20} />
            </span>
            <span className={nameClass}>{file.name || t('Untitled')}</span>
            <span className={metaClass}>
              <TimeAgo value={file.updatedAt} />
            </span>
          </button>
        );
      })}
    </div>
  );
};
