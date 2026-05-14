import * as React from 'react';
import {Range} from 'slate';
import {rsync} from '@jsonjoy.com/ui';
import {FontStyleButton} from '@jsonjoy.com/ui/lib/2-inline-block/FontStyleButton';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {formatKeys} from '../util/keys';
import {isMarkActive} from '../behavior';
import type {FontKind, MarkFormat, MenuItem} from '../types';
import type {MuTxtState} from '../state/MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import {isLeafFontActive, setLeafFont} from '../behavior/font';
import {getActiveBg, getActiveFg, getActiveMarkColor} from '../behavior/color';
import {MarkSwatchPanel} from './MarkSwatchPanel';
import {ColorPickerPanel} from './ColorPickerPanel';
import {getActiveMathInlineEntry} from '../behavior/math';
import BoldIcon__svg from 'iconista/lib/react/radix/font-bold';
import ItalicIcon__svg from 'iconista/lib/react/lucide/italic';
import UnderlineIcon__svg from 'iconista/lib/react/tabler/underline';
import OverlineIcon__svg from 'iconista/lib/react/tabler/overline';
import StrikethroughIcon__svg from 'iconista/lib/react/tabler/strikethrough';
import HighlightIcon__svg from 'iconista/lib/react/tabler/highlight';
import SpoilerIcon__svg from 'iconista/lib/react/tabler/lock-password';
import CodeIcon__svg from 'iconista/lib/react/tabler/code';
import SupIcon__svg from 'iconista/lib/react/tabler/superscript';
import SubIcon__svg from 'iconista/lib/react/tabler/subscript';
import KeyIcon__svg from 'iconista/lib/react/lucide/keyboard';
import InsertionIcon__svg from 'iconista/lib/react/tabler/pencil-plus';
import DeletionIcon__svg from 'iconista/lib/react/tabler/pencil-minus';
import LinkIcon__svg from 'iconista/lib/react/lucide/link';
import FgIcon__svg from 'iconista/lib/react/lucide/paintbrush';
import BgIcon__svg from 'iconista/lib/react/lucide/paint-bucket';
import MathIcon__svg from 'iconista/lib/react/tabler/math-function';
import ClearFormattingIcon__svg from 'iconista/lib/react/tabler/eraser';
import TypographyIcon__svg from 'iconista/lib/react/tabler/typography';

export interface InlineMenuItem extends MenuItem {
  mark: MarkFormat;
}

// Formatting: common
const BoldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <BoldIcon__svg width={15} height={15} {...props} />
);
const ItalicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ItalicIcon__svg width={16} height={16} {...props} />
);
const UnderlineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <UnderlineIcon__svg width={16} height={16} {...props} />
);
const OverlineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <OverlineIcon__svg width={16} height={16} {...props} />
);
const StrikethroughIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <StrikethroughIcon__svg width={16} height={16} {...props} />
);
const HighlightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <HighlightIcon__svg width={16} height={16} {...props} />
);
const SpoilerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SpoilerIcon__svg width={16} height={16} {...props} />
);

// Formatting: technical
const CodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <CodeIcon__svg width={16} height={16} {...props} />
);
const SupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SupIcon__svg width={16} height={16} {...props} />;
const SubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SubIcon__svg width={16} height={16} {...props} />;
const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <KeyIcon__svg width={16} height={16} {...props} />;
const InsertionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <InsertionIcon__svg width={16} height={16} {...props} />
);
const DeletionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <DeletionIcon__svg width={16} height={16} {...props} />
);

// Annotations
const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <LinkIcon__svg width={15} height={15} {...props} />
);
const FgIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FgIcon__svg width={16} height={16} {...props} />;
const BgIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <BgIcon__svg width={16} height={16} {...props} />;
const MathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <MathIcon__svg width={16} height={16} {...props} />
);

// Modify
const ClearFormattingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ClearFormattingIcon__svg width={16} height={16} {...props} />
);

// Typesetting
const TypographyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <TypographyIcon__svg width={16} height={16} {...props} />
);

const RECENT_LIMIT = 4;

export class InlineMenu implements UiLifeCycles {
  public readonly recent = rsync.val<MenuItem[]>([]);

  constructor(public readonly mutxt: MuTxtState) {}

  public start() {
    return () => {};
  }

  private markActive(mark: MarkFormat) {
    return rsync.comp([this.mutxt.version], () => isMarkActive(this.mutxt.editor, mark));
  }

  public readonly addRecent = (item: MenuItem): void => {
    const key = item.id ?? item.name;
    const next = [item, ...this.recent.value.filter((r) => (r.id ?? r.name) !== key)];
    if (next.length > RECENT_LIMIT) next.length = RECENT_LIMIT;
    this.recent.set(next);
  };

  private menuRecent(): MenuItem | null {
    const list = this.recent.value;
    if (list.length === 0) return null;
    return {
      id: 'recent',
      name: 'Recent',
      expand: RECENT_LIMIT,
      children: list,
    };
  }

  public build(): MenuItem {
    const recent = this.menuRecent();
    const children: MenuItem['children'] = [
      ...(recent ? [recent, {name: 'sep-recent', sep: true} as MenuItem] : []),
      this.menuFmt(),
      {name: 'sep-annon', sep: true},
      this.menuAnnotations({anchorFromSelection: true}),
      {name: 'sep-typesetting', sep: true},
      this.menuTypesetting(),
      {name: 'sep-modify', sep: true},
      this.menuModify(),
    ];
    return {
      name: 'Selection menu',
      maxToolbarItems: recent ? 5 : 4,
      children,
    };
  }

  public buildToolbarMenu(): MenuItem {
    return {
      name: 'Selection menu',
      maxToolbarItems: 4,
      children: [
        this.menuFmt(),
        {name: 'sep-annon', sep: true},
        this.menuAnnotations(),
        {name: 'sep-typesetting', sep: true},
        this.menuTypesetting(),
        {name: 'sep-modify', sep: true},
        this.menuModify(),
      ],
    };
  }

  public menuFmt(): MenuItem {
    const formatting: MenuItem = {
      name: 'Formatting',
      expandChild: 0,
      // preview: this.recent,
      children: [this.menuFmtCommon(), this.menuFmtTechnical(), this.menuFmtColors()] as MenuItem[],
      preview: [
        this.itemBold(),
        this.itemItalic(),
        this.itemUnderline(),
        this.itemCode(),
        this.itemHighlight(),
        this.itemFg(),
        this.itemBg(),
      ] as MenuItem[],
    };
    return formatting;
  }

  public menuFmtCommon(): MenuItem {
    return {
      id: 'fmt-common',
      name: 'Common',
      expand: 8,
      children: [
        this.itemBold(),
        this.itemItalic(),
        this.itemUnderline(),
        this.itemStrikethrough(),
        this.itemOverline(),
        this.itemHighlight(),
        this.itemSpoiler(),
      ],
    };
  }

  public itemBold(): InlineMenuItem {
    const keys = ['Primary', 'b'];
    return {
      mark: 'bold',
      name: 'Bold',
      text: 'strong heavy thick weight',
      icon: () => <BoldIcon />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys: [formatKeys(keys)],
      active: this.markActive('bold'),
      onSelect: () => {
        this.mutxt.api.toggleMark('bold');
      },
    };
  }
  public itemItalic(): InlineMenuItem {
    const keys = ['Primary', 'i'];
    return {
      mark: 'italic',
      name: 'Italic',
      text: 'em emphasis slant oblique cursive',
      icon: () => <ItalicIcon />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys: [formatKeys(keys)],
      active: this.markActive('italic'),
      onSelect: () => {
        this.mutxt.api.toggleMark('italic');
      },
    };
  }
  public itemUnderline(): InlineMenuItem {
    const keys = ['Primary', 'u'];
    return {
      mark: 'underline',
      name: 'Underline',
      text: 'underscore line under',
      icon: () => <UnderlineIcon />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys: [formatKeys(keys)],
      active: this.markActive('underline'),
      priority: 1,
      onSelect: () => {
        this.mutxt.api.toggleMark('underline');
      },
    };
  }
  public itemStrikethrough(): InlineMenuItem {
    const keys = ['Primary', 'Shift', 'x'];
    return {
      mark: 'strikethrough',
      name: 'Strikethrough',
      text: 'strike crossed line through cross-out',
      icon: () => <StrikethroughIcon />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys: [formatKeys(keys)],
      active: this.markActive('strikethrough'),
      onSelect: () => {
        this.mutxt.api.toggleMark('strikethrough');
      },
    };
  }
  public itemOverline(): InlineMenuItem {
    return {
      mark: 'overline',
      name: 'Overline',
      text: 'line over above top',
      icon: () => <OverlineIcon />,
      active: this.markActive('overline'),
      onSelect: () => {
        this.mutxt.api.toggleMark('overline');
      },
    };
  }
  public itemHighlight(): MenuItem {
    const mutxt = this.mutxt;
    return {
      name: 'Highlight',
      text: 'mark yellow background marker emphasis color',
      icon: () => <HighlightIcon />,
      active: rsync.comp([mutxt.version], () => getActiveMarkColor(mutxt.editor) !== undefined),
      pane: () => <MarkSwatchPanel mutxt={mutxt} />,
    };
  }
  public itemFg(): MenuItem {
    const mutxt = this.mutxt;
    return {
      name: 'Text color',
      text: 'fg foreground font color text',
      icon: () => <FgIcon />,
      active: rsync.comp([mutxt.version], () => !!getActiveFg(mutxt.editor)),
      pane: () => <ColorPickerPanel mutxt={mutxt} kind="fg" />,
    };
  }
  public itemBg(): MenuItem {
    const mutxt = this.mutxt;
    return {
      name: 'Background color',
      text: 'bg background fill color shading',
      icon: () => <BgIcon />,
      active: rsync.comp([mutxt.version], () => !!getActiveBg(mutxt.editor)),
      pane: () => <ColorPickerPanel mutxt={mutxt} kind="bg" />,
    };
  }
  public itemSpoiler(): InlineMenuItem {
    return {
      mark: 'spoiler',
      name: 'Spoiler',
      text: 'hide blur reveal redact secret hidden',
      icon: () => <SpoilerIcon />,
      active: this.markActive('spoiler'),
      onSelect: () => {
        this.mutxt.api.toggleMark('spoiler');
      },
    };
  }

  public menuFmtTechnical(): MenuItem {
    return {
      id: 'fmt-technical',
      name: 'Technical',
      expand: 8,
      sepBefore: true,
      children: [
        this.itemCode(),
        this.itemMath(),
        this.itemSup(),
        this.itemSub(),
        this.itemKey(),
        this.itemIns(),
        this.itemDel(),
      ],
    };
  }

  public menuFmtColors(): MenuItem {
    return {
      id: 'fmt-colors',
      name: 'Colors',
      expand: 8,
      sepBefore: true,
      children: [this.itemFg(), this.itemBg()],
    };
  }
  public itemCode(): InlineMenuItem {
    const keys = ['Primary', 'e'];
    return {
      mark: 'code',
      name: 'Code',
      text: 'inline monospace snippet variable identifier',
      icon: () => <CodeIcon width={16} height={16} />,
      right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
      keys: [formatKeys(keys)],
      active: this.markActive('code'),
      onSelect: () => {
        this.mutxt.api.toggleMark('code');
      },
    };
  }
  public itemSup(): InlineMenuItem {
    return {
      mark: 'sup',
      name: 'Superscript',
      text: 'sup raised exponent power above',
      icon: () => <SupIcon />,
      active: this.markActive('sup'),
      onSelect: () => {
        this.mutxt.api.toggleMark('sup');
      },
    };
  }
  public itemSub(): InlineMenuItem {
    return {
      mark: 'sub',
      name: 'Subscript',
      text: 'sub lowered chemistry below index',
      icon: () => <SubIcon />,
      active: this.markActive('sub'),
      onSelect: () => {
        this.mutxt.api.toggleMark('sub');
      },
    };
  }
  public itemKey(): InlineMenuItem {
    return {
      mark: 'kbd',
      name: 'Keyboard key',
      text: 'kbd shortcut button keystroke key',
      priority: 1,
      icon: () => <KeyIcon />,
      active: this.markActive('kbd'),
      onSelect: () => {
        this.mutxt.api.toggleMark('kbd');
      },
    };
  }
  public itemIns(): InlineMenuItem {
    return {
      mark: 'ins',
      name: 'Insertion',
      text: 'ins added inserted track changes diff',
      icon: () => <InsertionIcon />,
      active: this.markActive('ins'),
      onSelect: () => {
        this.mutxt.api.toggleMark('ins');
      },
    };
  }
  public itemDel(): InlineMenuItem {
    return {
      mark: 'del',
      name: 'Deletion',
      text: 'del removed deleted track changes diff strike',
      icon: () => <DeletionIcon />,
      active: this.markActive('del'),
      onSelect: () => {
        this.mutxt.api.toggleMark('del');
      },
    };
  }

  public menuAnnotations(opts: {anchorFromSelection?: boolean} = {}): MenuItem {
    return {
      name: 'Annotations',
      expand: 3,
      children: [this.itemLink(opts)],
    };
  }

  public itemMath(): MenuItem {
    const mutxt = this.mutxt;
    return {
      name: 'Equation',
      text: 'math equation formula latex inline tex',
      icon: () => <MathIcon />,
      active: rsync.comp([mutxt.version], () => !!getActiveMathInlineEntry(mutxt.editor)),
      onSelect: (event) => {
        event.preventDefault();
        const entry = getActiveMathInlineEntry(mutxt.editor);
        if (entry) {
          mutxt.inline.math.openEdit(entry[0], entry[1]);
        } else {
          mutxt.inline.math.openInsert();
        }
      },
    };
  }
  public itemLink(opts: {anchorFromSelection?: boolean} = {}): MenuItem {
    const mutxt = this.mutxt;
    const link = mutxt.inline.link;
    return {
      name: 'Link',
      text: 'url href hyperlink anchor web address a',
      icon: () => <LinkIcon />,
      disabled: rsync.comp([link.canOpen], ([canOpen]) => !canOpen),
      active: rsync.comp([mutxt.caretLinkHref], ([href]) => !!href),
      onSelect: (event) => {
        if (opts.anchorFromSelection) {
          link.setAnchorFromSelection();
        } else {
          const trigger = event.currentTarget as HTMLElement | null;
          if (trigger) link.setAnchorEl(trigger);
        }
        mutxt.inline.dismissed.next(true);
        link.toggle();
      },
    };
  }

  public menuTypesetting(): MenuItem {
    return {
      id: 'inline-typesetting',
      name: 'Typesetting',
      text: 'font face family typography typeface',
      icon: () => <TypographyIcon />,
      expand: 4,
      openOnTitleHov: true,
      children: [
        this.itemLeafFont('sans', 'Sans-serif', 'sans gothic grotesque modern'),
        this.itemLeafFont('serif', 'Serif', 'serif traditional roman'),
        this.itemLeafFont('slab', 'Slab', 'slab egyptian thick serif'),
        this.itemLeafFont('mono', 'Monospace', 'mono fixed code typewriter courier'),
      ],
    };
  }

  private itemLeafFont(kind: FontKind, name: string, text?: string): MenuItem {
    const mutxt = this.mutxt;
    const onSelect = (event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault();
      setLeafFont(mutxt.editor, kind);
      mutxt.sync(false);
    };
    const Option: React.FC<{size?: number}> = ({size}) => {
      mutxt.version.use();
      const active = isLeafFontActive(mutxt.editor, kind);
      return <FontStyleButton kind={kind} size={size} active={active} onMouseDown={onSelect} />;
    };
    return {
      name,
      text,
      icon: () => <Option size={16} />,
      iconBig: () => <Option />,
      active: rsync.comp([mutxt.version], () => isLeafFontActive(mutxt.editor, kind)),
      onSelect,
    };
  }

  public menuModify(): MenuItem {
    return {
      name: 'Modify',
      expand: 3,
      onSelect: () => {},
      children: [this.itemClear()],
    };
  }
  public itemClear(): MenuItem {
    const {mutxt} = this;
    return {
      name: 'Erase formatting',
      text: 'clear remove reset plain unformat strip styles marks',
      danger: true,
      icon: () => <ClearFormattingIcon width={16} height={16} />,
      disabled: rsync.comp([mutxt.version], () => {
        const sel = mutxt.editor.selection;
        return !sel || Range.isCollapsed(sel);
      }),
      onSelect: () => {
        mutxt.api.eraseMarks();
      },
    };
  }
}
