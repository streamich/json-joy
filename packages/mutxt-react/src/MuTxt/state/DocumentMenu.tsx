import * as React from 'react';
import {rule} from 'nano-theme';
import {rsync} from '@jsonjoy.com/ui';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {ShareDocumentForm} from '../chrome/ShareDocumentPane';
import {copyDefaultShareLink} from '../util/share';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {FontStyleButton} from '@jsonjoy.com/ui/lib/2-inline-block/FontStyleButton';
import {downloadBlob} from '@jsonjoy.com/collaborative-ui/lib/util/downloadBlob';
import {ReactEditor} from 'slate-react';
import {canRedo, canUndo, redo, undo} from '../behavior';
import {formatKeys} from '../util/keys';
import {EditableWidthButton, LABELS} from '../chrome/EditableWidthButton';
import {CustomStylesPanel} from '../custom-style/CustomStylesPanel';
import type {DisplayMode, EditableWidth, FontKind, MenuItem} from '../types';
import type {MuTxtState, ThemeOverride} from './MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import {default as DocumentIcon2} from 'iconista/lib/react/tabler/file-text';
import KeyboardIcon__svg from 'iconista/lib/react/tabler/keyboard';
import ThemeIcon__svg from 'iconista/lib/react/tabler/palette';
import ThemeAutoIcon__svg from 'iconista/lib/react/tabler/automatic-gearbox';
import ThemeLightIcon__svg from 'iconista/lib/react/ibm_32/light';
import ThemeDarkIcon__svg from 'iconista/lib/react/lucide/lamp-desk';
import ThemeDefaultIcon__svg from 'iconista/lib/react/tabler/restore';
import MaximizeIcon__svg from 'iconista/lib/react/tabler/maximize';
import MinimizeIcon__svg from 'iconista/lib/react/tabler/minimize';
import FullscreenIcon__svg from 'iconista/lib/react/tabler/arrows-maximize';
import TypographyIcon__svg from 'iconista/lib/react/tabler/typography';
import CustomStylesIcon__svg from 'iconista/lib/react/tabler/brush';
import GoToIcon__svg from 'iconista/lib/react/bootstrap/list-columns-reverse';
import ExportIcon__svg from 'iconista/lib/react/tabler/file-export';
import SaveIcon__svg from 'iconista/lib/react/tabler/device-floppy';
import DevelopersIcon__svg from 'iconista/lib/react/tabler/tools';
import EmbedIcon__svg from 'iconista/lib/react/tabler/code';
import BracesIcon__svg from 'iconista/lib/react/tabler/braces';
import PlainTextIcon__svg from 'iconista/lib/react/tabler/align-left';
import WidthIcon__svg from 'iconista/lib/react/tabler/arrows-horizontal';
import ShareIcon__svg from 'iconista/lib/react/ant_outline/share-alt';
import ShareCheckIcon__svg from 'iconista/lib/react/atlaskit/check';
import CopyLinkIcon__svg from 'iconista/lib/react/tabler/link';
import ShareOptionsIcon__svg from 'iconista/lib/react/tabler/adjustments';

const documentIcon = () => <DocumentIcon2 width={16} height={16} />;
const KeyboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <KeyboardIcon__svg width={16} height={16} {...props} />
);
const ThemeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ThemeIcon__svg width={16} height={16} {...props} />
);
const ThemeAutoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ThemeAutoIcon__svg width={16} height={16} {...props} />
);
const ThemeLightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ThemeLightIcon__svg width={16} height={16} fill="currentColor" {...props} />
);
const ThemeDarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ThemeDarkIcon__svg width={16} height={16} {...props} />
);
const ThemeDefaultIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ThemeDefaultIcon__svg width={16} height={16} {...props} />
);
const MaximizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <MaximizeIcon__svg width={16} height={16} {...props} />
);
const MinimizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <MinimizeIcon__svg width={16} height={16} {...props} />
);
const FullscreenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <FullscreenIcon__svg width={16} height={16} {...props} />
);
const TypographyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <TypographyIcon__svg width={16} height={16} {...props} />
);
const CustomStylesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <CustomStylesIcon__svg width={16} height={16} {...props} />
);

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
const GoToIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <GoToIcon__svg width={16} height={16} {...props} />
);
const ExportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ExportIcon__svg width={16} height={16} {...props} />
);
const SaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SaveIcon__svg width={16} height={16} {...props} />
);
const DevelopersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <DevelopersIcon__svg width={16} height={16} {...props} />
);
const EmbedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <EmbedIcon__svg width={16} height={16} {...props} />
);
// const BugIcon = makeIcon({set: 'tabler', icon: 'bug', width: 16, height: 16});
const BracesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <BracesIcon__svg width={16} height={16} {...props} />
);
// const TerminalIcon = makeIcon({set: 'tabler', icon: 'terminal-2', width: 16, height: 16});
const PlainTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <PlainTextIcon__svg width={16} height={16} {...props} />
);
const WidthIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <WidthIcon__svg width={16} height={16} {...props} />
);
const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ShareIcon__svg width={16} height={16} fill="currentColor" {...props} />
);
const ShareCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ShareCheckIcon__svg width={16} height={16} {...props} />
);
const CopyLinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <CopyLinkIcon__svg width={16} height={16} {...props} />
);
const ShareOptionsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ShareOptionsIcon__svg width={16} height={16} {...props} />
);

const SHARE_COPIED_RESET_MS = 2000;

const shareIconStackClass = rule({
  pos: 'relative',
  w: '16px',
  h: '16px',
  ov: 'hidden',
  d: 'inline-flex',
});

const shareIconLayerClass = rule({
  pos: 'absolute',
  t: 0,
  l: 0,
  trs: 'transform 150ms ease-in-out',
});

const ShareCopyAnimIcon: React.FC<{copied: rsync.ReactValue<boolean>}> = ({copied}) => {
  const isCopied = copied.use();
  return (
    <span className={shareIconStackClass}>
      <span className={shareIconLayerClass} style={{transform: isCopied ? 'translateY(100%)' : 'translateY(0%)'}}>
        <ShareIcon />
      </span>
      <span className={shareIconLayerClass} style={{transform: isCopied ? 'translateY(0%)' : 'translateY(-100%)'}}>
        <ShareCheckIcon />
      </span>
    </span>
  );
};

export class DocumentMenu implements UiLifeCycles {
  public readonly shareJustCopied = rsync.val(false);
  private shareCopyResetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(public readonly mutxt: MuTxtState) {}

  private readonly pulseShareCopied = (): void => {
    this.shareJustCopied.set(true);
    if (this.shareCopyResetTimer) clearTimeout(this.shareCopyResetTimer);
    this.shareCopyResetTimer = setTimeout(() => {
      this.shareCopyResetTimer = null;
      this.shareJustCopied.set(false);
    }, SHARE_COPIED_RESET_MS);
  };

  public start() {
    return () => {};
  }

  public buildHeaderToolbar(size: 0 | 1 | 2 | 3 | 4 | 5): MenuItem {
    const mutxt = this.mutxt;
    const toggleKeys = ['Primary', 'Shift', 'm'];
    const fullscreenKeys = ['Primary', 'Shift', 'f'];
    const activeFor = (mode: DisplayMode) => rsync.comp([mutxt.displayMode], ([m]) => m === mode);
    const option = (
      mode: DisplayMode,
      name: string,
      icon: () => React.ReactNode,
      keys?: string[],
      text?: string,
    ): MenuItem => ({
      name,
      text,
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
    if (size > 4) {
      children.push(this.itemUndo(), this.itemRedo(), {name: 'sep-undo', sep: true});
    }
    if (size > 2) {
      children.push({
        name: mutxt.displayMode.value === 'inline' ? 'Maximized' : 'Inline',
        text: 'display mode size view fullscreen maximize minimize fullwindow',
        split: size > 4 ? 'Display' : void 0,
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
                option('inline', 'Inline', () => <MinimizeIcon />, toggleKeys, 'embedded small minimize compact'),
                option(
                  'fullwindow',
                  'Maximized',
                  () => <MaximizeIcon />,
                  toggleKeys,
                  'fullwindow maximize expand large full window',
                ),
                option(
                  'fullscreen',
                  'Fullscreen',
                  () => <FullscreenIcon />,
                  fullscreenKeys,
                  'full screen presentation',
                ),
              ]
            : void 0,
      });
    }
    if (size > 0) {
      children.push(this.itemHeaderShare(size > 3));
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
      icon: documentIcon,
      children: [
        this.itemTypesetting(),
        this.itemCustomStyles(),
        this.itemEditableWidth(),
        {name: 'sep-export', sep: true},
        this.menuExport(),
        this.shareMenu(),
        {name: 'sep-display', sep: true},
        this.itemDisplayMode(),
        this.mutxt.translit.menu.build(),
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
      text: 'appearance color mode look palette skin',
      // sepBefore: true,
      // expand: 0,
      openOnTitleHov: true,
      icon: () => <ThemeIcon />,
      onSelect: () => {},
      children: [
        this.itemThemeOption(undefined, 'Default', () => <ThemeDefaultIcon />, 'reset original system'),
        this.itemThemeOption('auto', 'Auto', () => <ThemeAutoIcon />, 'system automatic os'),
        this.itemThemeOption('light', 'Light', () => <ThemeLightIcon />, 'white bright day'),
        this.itemThemeOption('dark', 'Dark', () => <ThemeDarkIcon />, 'night black'),
      ],
    };
  }

  private itemThemeOption(
    value: ThemeOverride | undefined,
    name: string,
    icon: () => React.ReactNode,
    text?: string,
  ): MenuItem {
    const mutxt = this.mutxt;
    return {
      name,
      text,
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
    const outline = mutxt.outline();
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
      text: 'jump scroll move find go',
      expand: 5,
      children: [this.itemGoTo(), {name: 'sep-history', sep: true}, this.itemUndo(), this.itemRedo()],
    };
  }

  public itemGoTo(): MenuItem {
    const items = this.outlineItems();
    return {
      name: 'Go to',
      text: 'jump navigate heading outline section',
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
      text: 'back revert reverse history step back',
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
      text: 'forward repeat history step forward reapply',
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
      text: 'font face family typography typeface document',
      expand: 4,
      openOnTitleHov: true,
      icon: () => <TypographyIcon />,
      onSelect: () => {},
      children: [
        this.itemFontOption('sans', 'Sans-serif', 'sans gothic grotesque modern'),
        this.itemFontOption('serif', 'Serif', 'serif traditional roman'),
        this.itemFontOption('slab', 'Slab', 'slab egyptian thick serif'),
        this.itemFontOption('mono', 'Monospace', 'mono fixed code typewriter courier'),
      ],
    };
  }

  public itemCustomStyles(): MenuItem {
    const mutxt = this.mutxt;
    const OverrideCount: React.FC = () => {
      const cs = mutxt.customStyle.cs.use();
      const n = Object.keys(cs).length;
      if (!n) return null;
      return <Sidetip small>{`${n} ${n === 1 ? 'style' : 'styles'}`}</Sidetip>;
    };
    return {
      name: 'Custom Styles',
      text: 'custom style typography font size weight color background line height letter spacing',
      icon: () => <CustomStylesIcon />,
      right: () => <OverrideCount />,
      minWidth: 330,
      panel: () => <CustomStylesPanel />,
    };
  }

  public itemEditableWidth(): MenuItem {
    return {
      name: 'Width',
      text: 'page column size narrow wide layout content area',
      sepBefore: true,
      expand: 3,
      openOnTitleHov: true,
      icon: () => <WidthIcon />,
      onSelect: () => {},
      children: [
        this.itemEditableWidthOption('narrow', 'narrow small thin tight'),
        this.itemEditableWidthOption('mid', 'mid medium middle default'),
        this.itemEditableWidthOption('wide', 'wide large broad full'),
      ],
    };
  }

  private itemEditableWidthOption(kind: EditableWidth, text?: string): MenuItem {
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
      text,
      icon: () => <Option size={16} />,
      iconBig: () => <Option />,
      active: rsync.comp([mutxt.editableWidth], ([w]) => w === kind),
      onSelect,
    };
  }

  private itemFontOption(kind: FontKind, name: string, text?: string): MenuItem {
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
      text,
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
      text: 'hotkey hot key bindings cheatsheet help kbd shortcut',
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
      text: 'mode size view layout fullscreen maximize minimize',
      icon: () => <MaximizeIcon />,
      children: [
        this.itemDisplayModeOption(
          'inline',
          'Inline',
          () => <MinimizeIcon />,
          undefined,
          'embedded small minimize compact',
        ),
        this.itemDisplayModeOption(
          'fullwindow',
          'Maximized',
          () => <MaximizeIcon />,
          ['Primary', 'Shift', 'm'],
          'fullwindow maximize expand large full window',
        ),
        this.itemDisplayModeOption(
          'fullscreen',
          'Fullscreen',
          () => <FullscreenIcon />,
          ['Primary', 'Shift', 'f'],
          'full screen presentation',
        ),
      ],
    };
  }

  private itemDisplayModeOption(
    mode: DisplayMode,
    name: string,
    icon: () => React.ReactNode,
    keys?: string[],
    text?: string,
  ): MenuItem {
    const mutxt = this.mutxt;
    const formatted = keys ? formatKeys(keys) : void 0;
    return {
      name,
      text,
      icon,
      keys: formatted ? [formatted] : void 0,
      right: formatted ? () => <Sidetip small>{formatted}</Sidetip> : void 0,
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
      text: 'download save file output',
      icon: () => <ExportIcon />,
      children: [this.itemSaveFile()],
    };
  }

  public shareMenu(): MenuItem {
    return {
      name: 'Share',
      text: 'send link copy publish collaborate invite',
      icon: () => <ShareIcon />,
      children: [this.itemCopyShareLink(), this.itemShareOptions()],
    };
  }

  public itemHeaderShare(split: boolean): MenuItem {
    return {
      name: 'Share',
      text: 'send link copy publish collaborate invite',
      icon: () => <ShareCopyAnimIcon copied={this.shareJustCopied} />,
      noHeader: true,
      onSelect: () => {
        const mutxt = this.mutxt;
        mutxt.omni.close();
        copyDefaultShareLink(mutxt.api.toBinary())
          .then(() => {
            this.pulseShareCopied();
            mutxt.toasts?.add({title: 'Share link copied to clipboard.', duration: 3000});
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error('[mutxt] copy share link failed', err);
            mutxt.toasts?.add({type: 'error', title: 'Failed to copy share link.', duration: 5000});
          });
      },
      split: split ? 'Share' : void 0,
      minWidth: split ? 380 : void 0,
      maxWidth: split ? 380 : void 0,
      children: split
        ? [
            {
              name: 'share-form',
              raw: () => <ShareDocumentForm />,
            },
          ]
        : void 0,
    };
  }

  public itemCopyShareLink(): MenuItem {
    return {
      name: 'Copy share link',
      text: 'url clipboard share send link copy',
      icon: () => <CopyLinkIcon />,
      onSelect: () => {
        const mutxt = this.mutxt;
        mutxt.omni.close();
        const bytes = mutxt.api.toBinary();
        copyDefaultShareLink(bytes)
          .then(() => {
            mutxt.toasts?.add({title: 'Share link copied to clipboard.', duration: 3000});
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error('[mutxt] copy share link failed', err);
            mutxt.toasts?.add({type: 'error', title: 'Failed to copy share link.', duration: 5000});
          });
      },
    };
  }

  public itemShareOptions(): MenuItem {
    return {
      name: 'Sharing options',
      text: 'share settings encryption metadata posts publish collaborators',
      more: true,
      icon: () => <ShareOptionsIcon />,
      minWidth: 480,
      maxWidth: 480,
      children: [
        {
          name: 'share-form',
          raw: () => <ShareDocumentForm />,
        },
      ],
    };
  }

  public itemSaveFile(): MenuItem {
    return {
      name: 'Save file',
      text: 'download export mutxt binary backup',
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
      text: 'debug dev tools developer advanced',
      icon: () => <DevelopersIcon />,
      children: [
        this.itemEmbedDocs(),
        {name: 'sep-dev-dumps', sep: true},
        this.itemPeritextDump(),
        this.itemModelDump(),
        this.itemSlateState(),
        this.itemPlainText(),
      ],
    };
  }

  public itemEmbedDocs(): MenuItem {
    return {
      name: 'Embed this editor',
      text: 'embed integrate install npm cdn html react component custom element web mutxt',
      icon: () => <EmbedIcon />,
      onSelect: () => {
        this.mutxt.omni.close();
        this.mutxt.embedDocsOpen.set(true);
      },
    };
  }

  public itemPeritextDump(): MenuItem {
    return {
      name: 'Peritext dump',
      text: 'peritext debug export crdt internal text representation',
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
      text: 'crdt model json debug export internal',
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
      text: 'slate json debug export tree internal nodes',
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
      text: 'txt unformatted raw export download text',
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
