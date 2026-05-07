import * as React from 'react';
import {rule} from 'nano-theme';
import {rsync} from '@jsonjoy.com/ui';
import {Iconista, makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {FontStyleButton} from '@jsonjoy.com/ui/lib/2-inline-block/FontStyleButton';
import {downloadBlob} from '@jsonjoy.com/collaborative-ui/lib/util/downloadBlob';
import {ReactEditor} from 'slate-react';
import {canRedo, canUndo, redo, undo} from '../behavior';
import {getDocumentOutline} from '../behavior/outline';
import {formatKeys} from '../util/keys';
import {EditableWidthButton, LABELS} from '../chrome/EditableWidthButton';
import type {DisplayMode, EditableWidth, FontKind, MenuItem, SlateEditorDocument} from '../types';
import type {MuTxtState, ThemeOverride} from './MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

const DocumentIcon = makeIcon({set: 'tabler', icon: 'file-text', width: 16, height: 16});
const KeyboardIcon = makeIcon({set: 'tabler', icon: 'keyboard', width: 16, height: 16});
const ThemeIcon = makeIcon({set: 'tabler', icon: 'palette', width: 16, height: 16});
const ThemeAutoIcon = makeIcon({set: 'tabler', icon: 'automatic-gearbox', width: 16, height: 16});
const ThemeLightIcon = makeIcon({set: 'ibm_32', icon: 'light', width: 16, height: 16});
const ThemeDarkIcon = makeIcon({set: 'lucide', icon: 'lamp-desk', width: 16, height: 16});
const ThemeDefaultIcon = makeIcon({set: 'tabler', icon: 'restore', width: 16, height: 16});
const MaximizeIcon = makeIcon({set: 'tabler', icon: 'maximize', width: 16, height: 16});
const MinimizeIcon = makeIcon({set: 'tabler', icon: 'minimize', width: 16, height: 16});
const FullscreenIcon = makeIcon({set: 'tabler', icon: 'arrows-maximize', width: 16, height: 16});
const TypographyIcon = makeIcon({set: 'tabler', icon: 'typography', width: 16, height: 16});

const rtlMirrorClass = rule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  '&:dir(rtl)': {
    transform: 'scaleX(-1)',
  },
});
const UndoIcon: React.FC = () => (
  <span className={rtlMirrorClass}>
    <Iconista set="lucide" icon="undo" width={16} height={16} />
  </span>
);
const RedoIcon: React.FC = () => (
  <span className={rtlMirrorClass}>
    <Iconista set="lucide" icon="redo" width={16} height={16} />
  </span>
);
const GoToIcon = makeIcon({set: 'bootstrap', icon: 'list-columns-reverse', width: 16, height: 16});
const ExportIcon = makeIcon({set: 'tabler', icon: 'file-export', width: 16, height: 16});
const SaveIcon = makeIcon({set: 'tabler', icon: 'device-floppy', width: 16, height: 16});
const DevelopersIcon = makeIcon({set: 'tabler', icon: 'tools', width: 16, height: 16});
// const BugIcon = makeIcon({set: 'tabler', icon: 'bug', width: 16, height: 16});
const BracesIcon = makeIcon({set: 'tabler', icon: 'braces', width: 16, height: 16});
// const TerminalIcon = makeIcon({set: 'tabler', icon: 'terminal-2', width: 16, height: 16});
const PlainTextIcon = makeIcon({set: 'tabler', icon: 'align-left', width: 16, height: 16});
const WidthIcon = makeIcon({set: 'tabler', icon: 'arrows-horizontal', width: 16, height: 16});

export class DocumentMenu implements UiLifeCycles {
  constructor(public readonly mutxt: MuTxtState) {}

  public start() {
    return () => {};
  }

  public buildHeaderToolbar(size: 0 | 1 | 2 | 3): MenuItem {
    const mutxt = this.mutxt;
    const toggleKeys = ['Primary', 'Shift', 'm'];
    const activeFor = (mode: DisplayMode) => rsync.comp([mutxt.displayMode], ([m]) => m === mode);
    const option = (mode: DisplayMode, name: string, icon: () => React.ReactNode, keys?: string[]): MenuItem => ({
      name,
      icon,
      keys: [formatKeys(toggleKeys)],
      right: keys ? () => <Sidetip small>{formatKeys(keys)}</Sidetip> : void 0,
      active: activeFor(mode),
      disabled: activeFor(mode),
      onSelect: () => {
        mutxt.omni.close();
        mutxt.setDisplayMode(mode);
      },
    });
    const children: MenuItem[] = [];
    if (size > 2) {
      children.push(this.itemUndo(), this.itemRedo(), {name: 'sep-undo', sep: true});
    }
    if (size > 0) {
      children.push({
        name: mutxt.displayMode.value === 'inline' ? 'Maximized' : 'Inline',
        split: size > 1 ? 'Display' : void 0,
        keys: [formatKeys(toggleKeys)],
        icon: () => (mutxt.displayMode.value === 'inline' ? <MaximizeIcon /> : <MinimizeIcon />),
        onSelect: () => {
          mutxt.omni.close();
          mutxt.setDisplayMode(mutxt.displayMode.value === 'inline' ? 'fullwindow' : 'inline');
        },
        noHeader: true,
        children:
          size > 1
            ? [
                option('inline', 'Inline', () => <MinimizeIcon />, toggleKeys),
                option('fullwindow', 'Maximized', () => <MaximizeIcon />, toggleKeys),
                option('fullscreen', 'Fullscreen', () => <FullscreenIcon />),
              ]
            : void 0,
      });
    }
    children.push(this.build());
    return {
      name: 'Document menu',
      children,
    };
  }

  public build(): MenuItem {
    return {
      name: 'Document',
      minWidth: 288,
      noHeader: true,
      icon: () => <DocumentIcon />,
      children: [
        this.itemTypesetting(),
        this.itemEditableWidth(),
        {name: 'sep-export', sep: true},
        this.menuExport(),
        {name: 'sep-display', sep: true},
        this.itemDisplayMode(),
        this.itemKeyboardShortcuts(),
        this.itemTheme(),
        {name: 'sep-nav', sep: true},
        this.menuNavigate(),
        {name: 'sep-devs', sep: true},
        this.menuDevelopers(),
      ],
    };
  }

  public itemTheme(): MenuItem {
    return {
      name: 'Theme',
      // sepBefore: true,
      // expand: 0,
      openOnTitleHov: true,
      icon: () => <ThemeIcon />,
      onSelect: () => {},
      children: [
        this.itemThemeOption(undefined, 'Default', () => <ThemeDefaultIcon />),
        this.itemThemeOption('auto', 'Auto', () => <ThemeAutoIcon />),
        this.itemThemeOption('light', 'Light', () => <ThemeLightIcon />),
        this.itemThemeOption('dark', 'Dark', () => <ThemeDarkIcon />),
      ],
    };
  }

  private itemThemeOption(value: ThemeOverride | undefined, name: string, icon: () => React.ReactNode): MenuItem {
    const mutxt = this.mutxt;
    return {
      name,
      icon,
      active: rsync.comp([mutxt.theme], ([t]) => t === value),
      onSelect: () => {
        mutxt.omni.close();
        mutxt.setTheme(value);
      },
    };
  }

  public outlineItems(): MenuItem[] {
    const mutxt = this.mutxt;
    const outline = getDocumentOutline(mutxt.editor.children as SlateEditorDocument);
    return outline.map((item) => ({
      id: item.key,
      name: item.title,
      display: () => (
        <div
          style={{
            paddingInlineStart: (item.level - 1) * 16,
            fontWeight: 400 + (3 - item.level) * 100,
            fontSize: item.level ? void 0 : '1.1em',
          }}
        >
          {item.title}
        </div>
      ),
      icon: () =>
        item.level ? (
          <Iconista set="tabler" icon={`h-${item.level}`} width={16} height={16} style={{opacity: 0.5}} />
        ) : (
          <Iconista set="lucide" icon="type" width={16} height={16} style={{opacity: 0.5}} />
        ),
      onSelect: () => {
        mutxt.omni.close();
        mutxt.api.navigateTo(item.path);
      },
    }));
  }

  public menuNavigate(): MenuItem {
    return {
      name: 'Navigate',
      expand: 5,
      children: [this.itemGoTo(), {name: 'sep-history', sep: true}, this.itemUndo(), this.itemRedo()],
    };
  }

  public itemGoTo(): MenuItem {
    const items = this.outlineItems();
    return {
      name: 'Go to',
      icon: () => <GoToIcon />,
      minWidth: Math.min(320, (typeof window !== 'undefined' ? window.innerWidth : 320) - 32),
      children: items.length
        ? items
        : [
            {
              name: 'No headings',
              disabled: rsync.comp([], () => true),
            },
          ],
    };
  }

  public itemUndo(): MenuItem {
    const mutxt = this.mutxt;
    const keys = ['Primary', 'z'];
    const formatted = formatKeys(keys);
    return {
      name: 'Undo',
      icon: () => <UndoIcon />,
      right: () => <Sidetip small>{formatted}</Sidetip>,
      keys: [formatted],
      disabled: rsync.comp([mutxt.version, mutxt.readOnly], () => mutxt.readOnly.value || !canUndo(mutxt.editor)),
      onSelect: this.exec(() => undo(mutxt.editor)),
    };
  }

  public itemRedo(): MenuItem {
    const mutxt = this.mutxt;
    const keys = ['Primary', 'Shift', 'z'];
    const formatted = formatKeys(keys);
    return {
      name: 'Redo',
      icon: () => <RedoIcon />,
      right: () => <Sidetip small>{formatted}</Sidetip>,
      keys: [formatted],
      disabled: rsync.comp([mutxt.version, mutxt.readOnly], () => mutxt.readOnly.value || !canRedo(mutxt.editor)),
      onSelect: this.exec(() => redo(mutxt.editor)),
    };
  }

  private readonly exec =
    (fn: () => void) =>
    (event: React.MouseEvent | React.TouchEvent): void => {
      event.preventDefault();
      const mutxt = this.mutxt;
      mutxt.omni.close();
      fn();
      ReactEditor.focus(mutxt.editor as ReactEditor);
      mutxt.setFocused(true);
      mutxt.sync(true);
    };

  public itemTypesetting(): MenuItem {
    return {
      name: 'Typesetting',
      expand: 4,
      openOnTitleHov: true,
      icon: () => <TypographyIcon />,
      onSelect: () => {},
      children: [
        this.itemFontOption('sans', 'Sans-serif'),
        this.itemFontOption('serif', 'Serif'),
        this.itemFontOption('slab', 'Slab'),
        this.itemFontOption('mono', 'Monospace'),
      ],
    };
  }

  public itemEditableWidth(): MenuItem {
    return {
      name: 'Width',
      sepBefore: true,
      expand: 3,
      openOnTitleHov: true,
      icon: () => <WidthIcon />,
      onSelect: () => {},
      children: [
        this.itemEditableWidthOption('narrow'),
        this.itemEditableWidthOption('mid'),
        this.itemEditableWidthOption('wide'),
      ],
    };
  }

  private itemEditableWidthOption(kind: EditableWidth): MenuItem {
    const mutxt = this.mutxt;
    const onSelect = () => {
      mutxt.omni.close();
      mutxt.setEditableWidth(kind);
    };
    const Option: React.FC<{size?: number}> = ({size}) => {
      const current = mutxt.editableWidth.use();
      return <EditableWidthButton kind={kind} size={size} active={current === kind} onClick={onSelect} />;
    };
    return {
      name: LABELS[kind],
      icon: () => <Option size={16} />,
      iconBig: () => <Option />,
      active: rsync.comp([mutxt.editableWidth], ([w]) => w === kind),
      onSelect,
    };
  }

  private itemFontOption(kind: FontKind, name: string): MenuItem {
    const mutxt = this.mutxt;
    const onSelect = () => {
      mutxt.omni.close();
      mutxt.setFont(kind);
    };
    const Option: React.FC<{size?: number}> = ({size}) => {
      const font = mutxt.font.use();
      return <FontStyleButton kind={kind} size={size} active={font === kind} onClick={onSelect} />;
    };
    return {
      name,
      icon: () => <Option size={16} />,
      iconBig: () => <Option />,
      active: rsync.comp([mutxt.font], ([f]) => f === kind),
      onSelect,
    };
  }

  public itemKeyboardShortcuts(): MenuItem {
    const formatted = formatKeys(['Primary', '/']);
    return {
      name: 'Keyboard shortcuts',
      icon: () => <KeyboardIcon />,
      right: () => <Sidetip small>{formatted}</Sidetip>,
      keys: [formatted],
      onSelect: () => {
        this.mutxt.omni.close();
        this.mutxt.shortcutsOpen.set(true);
      },
    };
  }

  public itemDisplayMode(): MenuItem {
    return {
      name: 'Display',
      icon: () => <MaximizeIcon />,
      children: [
        this.itemDisplayModeOption('inline', 'Inline', () => <MinimizeIcon />),
        this.itemDisplayModeOption('fullwindow', 'Maximized', () => <MaximizeIcon />),
        this.itemDisplayModeOption('fullscreen', 'Fullscreen', () => <FullscreenIcon />),
      ],
    };
  }

  private itemDisplayModeOption(mode: DisplayMode, name: string, icon: () => React.ReactNode): MenuItem {
    const mutxt = this.mutxt;
    return {
      name,
      icon,
      active: rsync.comp([mutxt.displayMode], ([m]) => m === mode),
      onSelect: () => {
        mutxt.omni.close();
        mutxt.setDisplayMode(mode);
      },
    };
  }

  public menuExport(): MenuItem {
    return {
      name: 'Export',
      icon: () => <ExportIcon />,
      children: [this.itemSaveFile()],
    };
  }

  public itemSaveFile(): MenuItem {
    return {
      name: 'Save file',
      icon: () => <SaveIcon />,
      right: () => <Sidetip small>{'.mutxt'}</Sidetip>,
      onSelect: () => {
        const mutxt = this.mutxt;
        mutxt.omni.close();
        const data = mutxt.api.toBinary();
        const blob = new Blob([data as BlobPart], {type: 'application/octet-stream'});
        downloadBlob(blob, 'document.mutxt');
      },
    };
  }

  public menuDevelopers(): MenuItem {
    return {
      name: 'Developers',
      icon: () => <DevelopersIcon />,
      children: [this.itemPeritextDump(), this.itemModelDump(), this.itemSlateState(), this.itemPlainText()],
    };
  }

  public itemPeritextDump(): MenuItem {
    return {
      name: 'Peritext dump',
      // icon: () => <TerminalIcon />,
      icon: () => <PlainTextIcon />,
      right: () => <Sidetip small>{'.txt'}</Sidetip>,
      onSelect: () => {
        const mutxt = this.mutxt;
        mutxt.omni.close();
        const peritext = mutxt.peritextRef().peritext();
        peritext.refresh();
        const text = peritext + '';
        const blob = new Blob([text], {type: 'text/plain'});
        downloadBlob(blob, 'peritext.txt');
      },
    };
  }

  public itemModelDump(): MenuItem {
    return {
      name: 'JSON CRDT dump',
      // icon: () => <TerminalIcon />,
      icon: () => <PlainTextIcon />,
      right: () => <Sidetip small>{'.txt'}</Sidetip>,
      onSelect: () => {
        const mutxt = this.mutxt;
        mutxt.omni.close();
        const text = mutxt.obj.api.model + '';
        const blob = new Blob([text], {type: 'text/plain'});
        downloadBlob(blob, 'crdt-model.txt');
      },
    };
  }

  public itemSlateState(): MenuItem {
    return {
      name: 'Editor state',
      icon: () => <BracesIcon />,
      right: () => <Sidetip small>{'.json'}</Sidetip>,
      onSelect: () => {
        const mutxt = this.mutxt;
        mutxt.omni.close();
        const text = JSON.stringify(mutxt.editor.children, null, 2);
        const blob = new Blob([text], {type: 'application/json'});
        downloadBlob(blob, 'editor-state.json');
      },
    };
  }

  public itemPlainText(): MenuItem {
    return {
      name: 'Plain text',
      icon: () => <PlainTextIcon />,
      right: () => <Sidetip small>{'.txt'}</Sidetip>,
      onSelect: () => {
        const mutxt = this.mutxt;
        mutxt.omni.close();
        const text = mutxt.peritextRef().peritext().strApi().view();
        const blob = new Blob([text], {type: 'text/plain'});
        downloadBlob(blob, 'document.txt');
      },
    };
  }
}
