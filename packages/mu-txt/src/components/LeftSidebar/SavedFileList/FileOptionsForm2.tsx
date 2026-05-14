import * as React from 'react';
import {ArgsPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu/ArgsPane';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {syncStore} from '@jsonjoy.com/ui/lib/hooks/useSyncStore';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useT} from 'use-t';
import {useExplorer} from '../../../context';
import type {MenuItem, Param} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import type {FileMetadataDto, OpenFile} from '../../../state/file';
import NameIcon__svg from 'iconista/lib/react/bootstrap/file-earmark-binary';
import HashIcon__svg from 'iconista/lib/react/bootstrap/hash';
import ClockIcon__svg from 'iconista/lib/react/bootstrap/clock';
import FileIcon__svg from 'iconista/lib/react/bootstrap/file-earmark';
import LinkIcon__svg from 'iconista/lib/react/bootstrap/link-45deg';
import FolderIcon__svg from 'iconista/lib/react/bootstrap/folder2-open';
import DownloadIcon__svg from 'iconista/lib/react/auth0/download';
import TrashIcon__svg from 'iconista/lib/react/bootstrap/trash2';

const NameIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <NameIcon__svg width={16} height={16} {...props} />;
const HashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <HashIcon__svg width={16} height={16} {...props} />;
const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ClockIcon__svg width={16} height={16} {...props} />;
const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FileIcon__svg width={16} height={16} {...props} />;
const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LinkIcon__svg width={16} height={16} {...props} />;
const FolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FolderIcon__svg width={16} height={16} {...props} />;
const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <DownloadIcon__svg width={16} height={16} {...props} />;
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <TrashIcon__svg width={16} height={16} {...props} />;

const renderNameIcon = () => <NameIcon />;
const renderHashIcon = () => <HashIcon />;
const renderClockIcon = () => <ClockIcon />;
const renderFileIcon = () => <FileIcon />;
const renderLinkIcon = () => <LinkIcon />;
const renderFolderIcon = () => <FolderIcon />;
const renderDownloadIcon = () => <DownloadIcon />;
const renderTrashIcon = () => <TrashIcon />;

export interface FileOptionsForm2Props {
  file: FileMetadataDto;
}

export const FileOptionsForm2: React.FC<FileOptionsForm2Props> = ({file}) => {
  const [t] = useT();
  const state = useExplorer();
  const popup = usePopup();
  const openFiles = useBehaviorSubject(state.files$);
  const openFile: OpenFile | undefined = openFiles.find((f) => f.id === file.id);
  const currentName = (openFile ? openFile.name.value : undefined) ?? file.name;
  const currentNameRef = React.useRef(currentName);
  currentNameRef.current = currentName;

  const onCancel = React.useCallback(() => {
    popup?.close();
  }, [popup]);

  const handleDownload = React.useCallback(() => {
    state.download(file.id).catch(() => {});
  }, [state, file.id]);

  const handleDelete = React.useCallback(async () => {
    popup?.close();
    await state.deleteSaved(file.id);
  }, [state, file.id, popup]);

  const item: MenuItem = React.useMemo(
    () => ({name: t('File options'), compact: true}),
    [t],
  );

  const handleSubmit = React.useCallback(() => {
    popup?.close();
  }, [popup]);

  const hasLink = !!file.link;
  const hasSize = !!openFile?.size;

  const params: (Param | MenuItem)[] = React.useMemo(() => {
    const list: (Param | MenuItem)[] = [];

    // list.push({name: t('File'), heading: true, collapsible: true});
    list.push({
      kind: 'str',
      id: 'name',
      name: t('Name'),
      icon: renderNameIcon,
      default: currentName,
      placeholder: t('Untitled'),
      onSubmit: handleSubmit,
    });
    list.push({
      kind: 'code',
      id: 'id',
      name: 'ID',
      icon: renderHashIcon,
      value: file.id,
    });

    list.push({name: t('Metadata'), heading: true, collapsible: true});
    list.push({
      kind: 'info',
      id: 'createdAt',
      name: t('Created'),
      icon: renderClockIcon,
      variant: 'date',
      value: file.createdAt,
    });
    list.push({
      kind: 'info',
      id: 'updatedAt',
      name: t('Updated'),
      icon: renderClockIcon,
      variant: 'date',
      value: file.updatedAt,
    });
    list.push({
      kind: 'info',
      id: 'size',
      name: t('Size'),
      icon: renderFileIcon,
      variant: 'bytes',
      value: openFile?.size ?? 0,
      visible: syncStore(hasSize),
    });

    if (hasLink && file.link) {
      list.push({name: t('Link'), heading: true, collapsible: true});
      list.push({
        kind: 'code',
        id: 'linkSource',
        name: t('Source'),
        icon: renderLinkIcon,
        value: file.link.source,
      });
      list.push({
        kind: 'code',
        id: 'linkPath',
        name: t('Path'),
        icon: renderFolderIcon,
        value: file.link.path,
      });
    }

    list.push({name: t('Actions'), heading: true, collapsible: true, initialCollapsed: true});
    list.push({
      kind: 'btn',
      id: 'download',
      name: t('Create a copy'),
      icon: renderDownloadIcon,
      buttonLabel: t('Download'),
      buttonIcon: renderDownloadIcon,
      onClick: handleDownload,
    });

    list.push({
      name: t('Danger zone'),
      heading: true,
      collapsible: true,
      initialCollapsed: true,
      danger: true,
    });
    list.push({
      kind: 'btn',
      id: 'delete',
      name: '',
      buttonLabel: t('Delete permanently'),
      buttonIcon: renderTrashIcon,
      danger: true,
      confirm: true,
      confirmLabel: t('Confirm delete'),
      confirmActionLabel: t('Delete'),
      onClick: handleDelete,
    });

    return list;
  }, [
    t,
    currentName,
    file.id,
    file.createdAt,
    file.updatedAt,
    file.link,
    hasLink,
    hasSize,
    openFile?.size,
    handleDownload,
    handleDelete,
    handleSubmit,
  ]);

  const onChange = React.useCallback(
    (_list: [string, unknown][], map: Record<string, unknown>) => {
      const nextName = (map.name as string | undefined) ?? '';
      if (nextName === currentNameRef.current) return;
      if (openFile) {
        state.renameFile(openFile, nextName);
      } else {
        void state.rename(file.id, nextName);
      }
    },
    [openFile, state, file.id],
  );

  return <ArgsPane item={item} params={params} onCancel={onCancel} onChange={onChange} minWidth={300} />;
};
