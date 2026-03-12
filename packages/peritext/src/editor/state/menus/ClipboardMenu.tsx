import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {MenuItem} from '../../types';
import type {BufferDetail} from 'json-joy/lib/json-crdt-extensions/peritext/events';
import type {EditorState} from '../EditorState';

const ClipboardCopyIcon = makeIcon({set: 'radix', icon: 'clipboard-copy'});
const ClipboardIcon = makeIcon({set: 'radix', icon: 'clipboard'});
const ScissorsIcon = makeIcon({set: 'tabler', icon: 'scissors'});
const JsonIcon = makeIcon({set: 'tabler', icon: 'json'});
const CopyIcon = makeIcon({set: 'lucide', icon: 'copy'});
const TextIcon = makeIcon({set: 'lucide', icon: 'text'});
const MarkdownIcon = makeIcon({set: 'simple', icon: 'markdown'});
const Html5Icon = makeIcon({set: 'simple', icon: 'html5'});

export interface ClipboardMenuCtx {
  hideStyleActions?: boolean;
  onBeforeAction?: (item: MenuItem, action: 'cut' | 'copy' | 'paste') => void | Partial<BufferDetail>;
}

export class ClipboardMenu {
  constructor(
    public readonly state: EditorState,
  ) {}

  public readonly copyAsMenu = (action: 'copy' | 'cut', ctx: ClipboardMenuCtx = {}): MenuItem => {
    const icon =
      action === 'copy'
        ? () => <ClipboardCopyIcon width={15} height={15} />
        : () => <ScissorsIcon width={16} height={16} />;
    const et = this.state.surface.events.et;
    const iconMarkdown = () => <MarkdownIcon width={16} height={16} style={{opacity: 0.5}} />;
    const iconHtml = () => <Html5Icon width={14} height={14} style={{opacity: 0.5}} />;
    const iconJson = () => <JsonIcon width={16} height={16} style={{opacity: 0.5}} />;
    const markdownAction: MenuItem = {
      name: 'Markdown',
      text: action + ' markdown md',
      icon,
      right: iconMarkdown,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(markdownAction, action), action, format: 'md'});
      },
    };
    const mdastAction: MenuItem = {
      name: 'MDAST',
      text: action + ' markdown md mdast',
      icon,
      right: iconMarkdown,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(mdastAction, action), action, format: 'mdast'});
      },
    };
    const htmlAction: MenuItem = {
      name: 'HTML',
      text: action + ' html',
      icon,
      right: iconHtml,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(htmlAction, action), action, format: 'html'});
      },
    };
    const hastAction: MenuItem = {
      name: 'HAST',
      text: action + ' html hast',
      icon,
      right: iconHtml,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(hastAction, action), action, format: 'hast'});
      },
    };
    const jsonAction: MenuItem = {
      name: 'Range view',
      text: action + ' range view peritext',
      icon,
      right: iconJson,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(jsonAction, action), action, format: 'json'});
      },
    };
    const jsonmlAction: MenuItem = {
      name: 'Fragment ML',
      text: action + ' peritext fragment ml node',
      icon,
      right: iconJson,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(jsonmlAction, action), action, format: 'jsonml'});
      },
    };
    const fragmentAction: MenuItem = {
      name: 'Fragment text',
      text: action + 'peritext fragment debug',
      icon,
      right: () => <TextIcon width={16} height={16} style={{opacity: 0.5}} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(fragmentAction, action), action, format: 'fragment'});
      },
    };
    return {
      name: action === 'copy' ? 'Copy as' : 'Cut as',
      more: true,
      icon,
      children: [
        markdownAction,
        mdastAction,
        {
          name: 'MD sep',
          sep: true,
        },
        htmlAction,
        hastAction,
        {
          name: 'HTML sep',
          sep: true,
        },
        jsonAction,
        jsonmlAction,
        fragmentAction,
      ],
    };
  };

  public readonly pasteAsMenu = (ctx: ClipboardMenuCtx = {}): MenuItem => {
    const icon = () => <ClipboardIcon width={15} height={15} />;
    const iconMarkdown = () => <MarkdownIcon width={16} height={16} style={{opacity: 0.5}} />;
    const iconHtml = () => <Html5Icon width={14} height={14} style={{opacity: 0.5}} />;
    const iconJson = () => <JsonIcon width={16} height={16} style={{opacity: 0.5}} />;
    const et = this.state.surface.events.et;
    const markdownAction: MenuItem = {
      name: 'Markdown',
      text: 'paste markdown md',
      icon,
      right: iconMarkdown,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(markdownAction, 'paste'), action: 'paste', format: 'md'});
      },
    };
    const mdastAction: MenuItem = {
      name: 'MDAST',
      text: 'paste markdown md mdast',
      icon,
      right: iconMarkdown,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(mdastAction, 'paste'), action: 'paste', format: 'mdast'});
      },
    };
    const htmlAction: MenuItem = {
      name: 'HTML',
      text: 'paste html',
      icon,
      right: iconHtml,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(htmlAction, 'paste'), action: 'paste', format: 'html'});
      },
    };
    const hastAction: MenuItem = {
      name: 'HAST',
      text: 'paste html hast',
      icon,
      right: iconHtml,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(hastAction, 'paste'), action: 'paste', format: 'hast'});
      },
    };
    const jsonAction: MenuItem = {
      name: 'Range view',
      text: 'paste range view peritext',
      icon,
      right: iconJson,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(jsonAction, 'paste'), action: 'paste', format: 'json'});
      },
    };
    const jsonmlAction: MenuItem = {
      name: 'Fragment ML',
      text: 'paste peritext fragment ml node',
      icon,
      right: iconJson,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(jsonmlAction, 'paste'), action: 'paste', format: 'jsonml'});
      },
    };
    return {
      name: 'Paste as',
      more: true,
      icon,
      children: [
        markdownAction,
        mdastAction,
        {
          name: 'MD sep',
          sep: true,
        },
        htmlAction,
        hastAction,
        {
          name: 'HTML sep',
          sep: true,
        },
        jsonAction,
        jsonmlAction,
      ],
    };
  };

  public readonly copyMenu = (ctx: ClipboardMenuCtx = {}): MenuItem => {
    const et = this.state.surface.events.et;
    const copyAction: MenuItem = {
      name: 'Copy',
      icon: () => <ClipboardCopyIcon width={15} height={15} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(copyAction, 'copy'), action: 'copy'});
      },
    };
    const copyTextOnlyAction: MenuItem = {
      name: 'Copy text only',
      icon: () => <ClipboardCopyIcon width={15} height={15} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(copyTextOnlyAction, 'copy'), action: 'copy', format: 'text'});
      },
    };
    const children: MenuItem[] = [copyAction, copyTextOnlyAction];
    if (!ctx.hideStyleActions) {
      const copyStyleAction: MenuItem = {
        name: 'Copy style',
        icon: () => <ClipboardCopyIcon width={15} height={15} />,
        onSelect: () => {
          et.buffer({...ctx.onBeforeAction?.(copyStyleAction, 'copy'), action: 'copy', format: 'style'});
        },
      };
      children.push(copyStyleAction);
    }
    children.push(this.copyAsMenu('copy', ctx));
    return {
      id: 'copy-menu',
      name: 'Copy',
      icon: () => <ClipboardCopyIcon width={15} height={15} />,
      expand: 5,
      children,
    };
  };

  public readonly cutMenu = (ctx: ClipboardMenuCtx = {}): MenuItem => {
    const et = this.state.surface.events.et;
    const cutAction: MenuItem = {
      name: 'Cut',
      danger: true,
      icon: () => <ScissorsIcon width={16} height={16} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(cutAction, 'cut'), action: 'cut'});
      },
    };
    const cutTextAction: MenuItem = {
      name: 'Cut text only',
      danger: true,
      icon: () => <ScissorsIcon width={16} height={16} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(cutTextAction, 'cut'), action: 'cut', format: 'text'});
      },
    };
    return {
      id: 'cut-menu',
      name: 'Cut',
      icon: () => <ScissorsIcon width={16} height={16} />,
      expand: 5,
      children: [cutAction, cutTextAction, this.copyAsMenu('cut', ctx)],
    };
  };

  public readonly pasteMenu = (ctx: ClipboardMenuCtx = {}): MenuItem => {
    const et = this.state.surface.events.et;
    const pasteAction: MenuItem = {
      name: 'Paste',
      icon: () => <ClipboardIcon width={15} height={15} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(pasteAction, 'paste'), action: 'paste'});
      },
    };
    const pasteTextAction: MenuItem = {
      name: 'Paste text',
      icon: () => <ClipboardIcon width={15} height={15} />,
      onSelect: () => {
        et.buffer({...ctx.onBeforeAction?.(pasteTextAction, 'paste'), action: 'paste', format: 'text'});
      },
    };
    const children: MenuItem[] = [pasteAction, pasteTextAction];
    if (!ctx.hideStyleActions) {
      const pasteStyleAction: MenuItem = {
        name: 'Paste style',
        icon: () => <ClipboardIcon width={15} height={15} />,
        onSelect: () => {
          et.buffer({...ctx.onBeforeAction?.(pasteStyleAction, 'paste'), action: 'paste', format: 'style'});
        },
      };
      children.push(pasteStyleAction);
    }
    children.push(this.pasteAsMenu(ctx));
    return {
      id: 'paste-menu',
      name: 'Paste',
      icon: () => <ClipboardIcon width={15} height={15} />,
      expand: 5,
      children,
    };
  };

  public readonly clipboardMenu = (ctx: ClipboardMenuCtx = {}): MenuItem => {
    const copyMenu = this.copyMenu(ctx);
    const cutMenu = this.cutMenu(ctx);
    const pasteMenu = this.pasteMenu(ctx);
    cutMenu.sepBefore = true;
    pasteMenu.sepBefore = true;
    return {
      name: 'Copy, cut, and paste',
      icon: () => <CopyIcon width={16} height={16} />,
      expand: 0,
      sepBefore: true,
      children: [copyMenu, cutMenu, pasteMenu],
    };
  };
}
