import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import {ToolbarMenu} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu';
import {downloadFile} from '@jsonjoy.com/ui/lib/6-page/DocsPages/util';
import DownloadIcon from 'iconista/lib/react/auth0/download';
import ExpandIcon from 'iconista/lib/react/tabler/arrows-maximize';
import CollapseIcon from 'iconista/lib/react/tabler/arrows-minimize';
import CompactIcon from 'iconista/lib/react/tabler/braces';
import CopyIcon from 'iconista/lib/react/tabler/copy';
import IsolateIcon from 'iconista/lib/react/tabler/focus-centered';
import EditIcon from 'iconista/lib/react/tabler/pencil';
import AddIcon from 'iconista/lib/react/tabler/plus';
import DeleteIcon from 'iconista/lib/react/tabler/trash';
import * as React from 'react';
import {useT} from 'use-t';

const icon = (Cmp: React.FC<React.SVGProps<SVGSVGElement>>) => () => <Cmp width={16} height={16} />;

const fileName = (name: string | undefined, fallback: string): string =>
  (name ?? fallback).replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || fallback;

const copy = (text: string): void => void navigator.clipboard?.writeText(text);

const PANE = {compact: true} as const;
const MORE = {small: true} as const;
const minWidth = 220;

export interface JsonToolbarProps {
  /** The JSON value this toolbar copies/downloads. */
  data: unknown;
  /** Base name (without extension) used for the downloaded file. Defaults to `data`. */
  name?: string;
  /** Focuses this node's property-name input. Shown as "Edit key" (object keys only). */
  onEditKey?: () => void;
  /** Focuses this node's value input. Shown as "Edit value" (primitive values only). */
  onEditValue?: () => void;
  /** Begins inserting a new child into this node. */
  onAdd?: () => void;
  /** Label for the {@link onAdd} action, e.g. `Add key` / `Add element`. */
  addLabel?: string;
  /** Deletes this node. When set, a "Delete" action is shown. */
  onDelete?: () => void;
  /** Isolates the view on this node alone. When set, an "Isolate" action is shown. */
  onIsolate?: () => void;
  /** Expands this node and every container under it. When set, an "Expand all" action is shown. */
  onExpandAll?: () => void;
  /** Collapses this node and every container under it. When set, a "Collapse all" action is shown. */
  onCollapseAll?: () => void;
}

/**
 * The small overflow toolbar shown in the top-right corner of a focused JSON
 * node. A single chevron button opens a menu: node actions grouped under
 * "Actions" (edit key/value, add child, delete) plus copy/download.
 */
export const JsonToolbar: React.FC<JsonToolbarProps> = ({
  data,
  name,
  onEditKey,
  onEditValue,
  onAdd,
  addLabel,
  onDelete,
  onIsolate,
  onExpandAll,
  onCollapseAll,
}) => {
  const [t] = useT();
  const menu = React.useMemo<MenuItem>(() => {
    const json = (compact?: boolean) => (compact ? JSON.stringify(data) : JSON.stringify(data, null, 2));
    const base = () => fileName(name, 'data');
    const actions: MenuItem[] = [];
    if (onEditKey) actions.push({id: 'edit-key', name: t('Edit key'), icon: icon(EditIcon), onSelect: onEditKey});
    if (onEditValue)
      actions.push({id: 'edit-value', name: t('Edit value'), icon: icon(EditIcon), onSelect: onEditValue});
    if (onAdd) actions.push({id: 'add', name: t(addLabel ?? 'Add'), icon: icon(AddIcon), onSelect: onAdd});
    if (onDelete)
      actions.push({id: 'delete', name: t('Delete'), icon: icon(DeleteIcon), danger: true, onSelect: onDelete});
    const items: MenuItem[] = [];
    if (onIsolate) items.push({id: 'isolate', name: t('Isolate'), icon: icon(IsolateIcon), onSelect: onIsolate});
    if (onExpandAll) items.push({id: 'expand', name: t('Expand all'), icon: icon(ExpandIcon), onSelect: onExpandAll});
    if (onCollapseAll)
      items.push({id: 'collapse', name: t('Collapse all'), icon: icon(CollapseIcon), onSelect: onCollapseAll});
    const hasView = items.length > 0;
    if (actions.length)
      items.push({id: 'actions', name: t('Actions'), sepBefore: hasView, expand: 6, children: actions});
    items.push(
      {
        id: 'copy',
        name: t('Copy JSON'),
        sepBefore: actions.length > 0 || hasView,
        icon: icon(CopyIcon),
        onSelect: () => copy(json()),
      },
      {id: 'copy-compact', name: t('Copy compact JSON'), icon: icon(CompactIcon), onSelect: () => copy(json(true))},
      {
        id: 'download',
        name: t('Download JSON'),
        sepBefore: true,
        icon: icon(DownloadIcon),
        onSelect: () => downloadFile(`${base()}.json`, json(), 'application/json'),
      },
    );
    return {
      name: '',
      maxToolbarItems: 1,
      children: [
        {
          id: 'menu',
          name: t('Menu'),
          chevronOnly: true,
          minWidth,
          noHeader: true,
          children: items,
        },
      ],
    };
  }, [data, name, onEditKey, onEditValue, onAdd, addLabel, onDelete, onIsolate, onExpandAll, onCollapseAll, t]);

  const stopNative = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }, []);
  const stop = React.useCallback((e: React.SyntheticEvent) => e.stopPropagation(), []);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: interaction is handled inside the menu
    <span onMouseDown={stopNative} onTouchStart={stopNative} onClick={stop}>
      <ToolbarMenu menu={menu} compact small pane={PANE} more={MORE} />
    </span>
  );
};
