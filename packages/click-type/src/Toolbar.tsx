import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import {ToolbarMenu} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu';
import {downloadFile} from '@jsonjoy.com/ui/lib/6-page/DocsPages/util';
import {FileIcon} from '@jsonjoy.com/ui/lib/1-inline/FileIcon';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import ExpandIcon from 'iconista/lib/react/tabler/arrows-maximize';
import CollapseIcon from 'iconista/lib/react/tabler/arrows-minimize';
import IsolateIcon from 'iconista/lib/react/tabler/focus-centered';
// import CompactIcon from 'iconista/lib/react/tabler/braces';
// import JtdIcon from 'iconista/lib/react/tabler/code';
import CopyIcon from 'iconista/lib/react/tabler/copy';
// import SampleIcon from 'iconista/lib/react/tabler/dice';
import DownloadIcon from 'iconista/lib/react/auth0/download';
import ExportIcon from 'iconista/lib/react/elastic/export';
// import TsIcon from 'iconista/lib/react/tabler/file-type-ts';
// import TsIcon from 'iconista/lib/react/bootstrap/filetype-tsx';
// import JsonIcon from 'iconista/lib/react/bootstrap/filetype-json';
// import JsonSchemaIcon from 'iconista/lib/react/tabler/json';
// import PointerIcon from 'iconista/lib/react/tabler/route';
import * as React from 'react';

const icon = (Cmp: React.FC<React.SVGProps<SVGSVGElement>>) => () => <Cmp width={16} height={16} />;

const fileName = (name: string | undefined, fallback: string): string =>
  (name ?? fallback).replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || fallback;

const copy = (text: string): void => void navigator.clipboard?.writeText(text);

// Stable references so the ToolbarMenu doesn't see new props each render.
const PANE = {compact: true} as const;
const MORE = {small: true} as const;
const minWidth = 266;

export interface SchemaToolbarProps {
  /** The JSON this toolbar copies/downloads — a node's schema, an example value, etc. */
  data: unknown;
  /** Base name (without extension) used for the downloaded file. */
  name?: string;
  /** Noun used in the menu labels: "Copy <noun>" / "Download <noun>". Defaults to `schema`. */
  noun?: string;
  /** When set, adds a "Copy JSON Pointer" item that copies this pointer. */
  pointer?: string;
  /** When true, {@link data} is a schema — adds TypeScript/JSON Schema/JTD/sample actions (lazy). */
  convert?: boolean;
  /** Adds an "Expand all" item that expands this node and everything under it. */
  onExpandAll?: () => void;
  /** Adds a "Collapse all" item that collapses this node and everything under it. */
  onCollapseAll?: () => void;
  /** Adds an "Isolate" item that focuses the view on this node alone (see isolation). */
  onIsolate?: () => void;
}

/**
 * The small overflow toolbar shown in the top-right corner of a focused hover
 * area. A single chevron button opens a menu of actions on the area's JSON
 * ({@link data}) — copy/download/convert/expand. Schema conversions are lazily
 * imported so the heavy `@jsonjoy.com/json-type` code only loads on demand.
 */
export const SchemaToolbar: React.FC<SchemaToolbarProps> = ({
  data,
  name,
  noun = 'schema',
  pointer,
  convert,
  onExpandAll,
  onCollapseAll,
  onIsolate,
}) => {
  const menu = React.useMemo<MenuItem>(() => {
    const json = (compact?: boolean) => (compact ? JSON.stringify(data) : JSON.stringify(data, null, 2));
    const base = () => fileName(name, noun);
    const items: MenuItem[] = [];
    if (onIsolate) items.push({id: 'isolate', name: 'Isolate', icon: icon(IsolateIcon), onSelect: onIsolate});
    if (onExpandAll) items.push({id: 'expand', name: 'Expand all', icon: icon(ExpandIcon), onSelect: onExpandAll});
    if (onCollapseAll)
      items.push({id: 'collapse', name: 'Collapse all', icon: icon(CollapseIcon), onSelect: onCollapseAll});
    const copyItems: MenuItem[] = [
      {id: 'copy', name: `Copy ${noun}`, icon: icon(CopyIcon), onSelect: () => copy(json())},
      {id: 'copy-compact', name: 'Copy compact', icon: icon(CopyIcon), onSelect: () => copy(json(true))},
    ];
    if (pointer !== undefined)
      copyItems.push({
        id: 'copy-pointer',
        name: 'Copy JSON Pointer',
        icon: icon(CopyIcon),
        onSelect: () => copy(pointer),
      });
    if (convert)
      copyItems.push({
        id: 'sample',
        name: 'Copy random sample value',
        icon: icon(CopyIcon),
        onSelect: async () => {
          const {toSample} = await import('./converters/sample');
          copy(toSample(data));
        },
      });
    items.push({
      id: 'copy',
      name: 'Copy',
      sepBefore: items.length > 0,
      children: copyItems,
      expand: 6,
    });
    if (convert) {
      items.push({
        name: 'Download',
        expand: 6,
        sepBefore: true,
        minWidth,
        children: [
          {
            id: 'dl-json',
            name: 'Download JSON Type',
            minWidth,
            right: () => <Code compact>.json</Code>,
            icon: () => <FileIcon label={'json'} ext={'json'} size={16} />,
            onSelect: () => downloadFile(`${base()}.json`, json(), 'application/json'),
          },
          {
            id: 'download',
            name: 'Export as',
            minWidth,
            more: true,
            icon: icon(ExportIcon),
            children: [
              {
                id: 'dl-ts',
                name: 'TypeScript',
                right: () => <Code compact>.ts</Code>,
                icon: () => <FileIcon label={'ts'} ext={'ts'} size={16} />,
                onSelect: async () => {
                  const {toTypeScript} = await import('./converters/typescript');
                  downloadFile(`${base()}.ts`, toTypeScript(data), 'text/typescript');
                },
              },
              {
                id: 'dl-jsonschema',
                name: 'JSON Schema',
                right: () => <Code compact>.schema.json</Code>,
                icon: () => <FileIcon label={'json'} ext={'json'} size={16} />,
                onSelect: async () => {
                  const {toJsonSchema} = await import('./converters/jsonSchema');
                  downloadFile(`${base()}.schema.json`, toJsonSchema(data), 'application/json');
                },
              },
              {
                id: 'dl-jtd',
                name: 'JTD',
                right: () => <Code compact>.jtd.json</Code>,
                // icon: icon(JsonIcon),
                icon: () => <FileIcon label={'json'} ext={'json'} size={16} />,
                onSelect: async () => {
                  const {toJtd} = await import('./converters/jtd');
                  downloadFile(`${base()}.jtd.json`, toJtd(data), 'application/json');
                },
              },
            ],
          },
        ],
      });
    } else {
      items.push({
        id: 'download',
        name: `Download ${noun}`,
        sepBefore: true,
        icon: icon(DownloadIcon),
        onSelect: () => downloadFile(`${base()}.json`, json(), 'application/json'),
      });
    }
    return {
      name: '',
      maxToolbarItems: 1,
      children: [
        {
          id: 'menu',
          name: 'Menu',
          chevronOnly: true,
          minWidth,
          noHeader: true,
          children: items,
        },
      ],
    };
  }, [data, name, noun, pointer, convert, onExpandAll, onCollapseAll, onIsolate]);

  const stopNative = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }, []);
  const stop = React.useCallback((e: React.SyntheticEvent) => e.stopPropagation(), []);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: interaction is handled inside the menu
    <span onMouseDown={stopNative} onTouchStart={stopNative} onClick={stop} onDoubleClick={stop}>
      <ToolbarMenu menu={menu} compact small pane={PANE} more={MORE} />
    </span>
  );
};
