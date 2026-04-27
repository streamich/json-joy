import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {ToolbarItem} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarItem';
import {ToolbarMenu} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu';
import {ToolbarSep} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarSep';
import type {Editor} from 'slate';
import {
  ACTION_BUTTONS,
  ALIGNMENT_BUTTONS,
  BLOCK_BUTTONS,
  LAYOUT_BUTTONS,
  LIST_BUTTONS,
  canRedo,
  canUndo,
  isAlignmentActive,
  isBlockActive,
  isListActive,
  redo,
  setAlignment,
  toggleBlock,
  undo,
} from '../../behavior';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {EmbedToolbarButton} from './embed/EmbedToolbarButton';
import {DocumentOutlineButton} from '../../chrome/DocumentOutlineButton';
import {useMuTxt} from '../../context';
import type {MenuItem} from '../../types';
import {formatKeys} from '../../util/keys';

const blockClass = rule({
  pos: 'relative',
  pd: '8px 32px',
  bxz: 'border-box',
  ovx: 'auto',
});

const toolbarContainerClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'center',
  h: '32px',
});

export interface MuTxtHeaderProps {
  editor: Editor;
  readOnly?: boolean;
  onVisualChange: () => void;
}

export const MuTxtHeader: React.FC<MuTxtHeaderProps> = ({editor, readOnly, onVisualChange}) => {
  const mutxt = useMuTxt();
  const styles = useStyles();
  const toolbarVersion = mutxt.version.use();

  void toolbarVersion;

  const execute = React.useCallback(
    (callback: () => void): React.MouseEventHandler =>
      (event) => {
        event.preventDefault();
        if (readOnly) return;
        callback();
        onVisualChange();
      },
    [onVisualChange, readOnly],
  );

  const renderItem = React.useCallback(
    ({
      key,
      title,
      iconSet,
      icon,
      shortcut,
      active,
      disabled,
      onMouseDown,
    }: {
      key: string;
      title: string;
      iconSet: string;
      icon: string;
      shortcut?: string;
      active?: boolean;
      disabled?: boolean;
      onMouseDown: React.MouseEventHandler;
    }) => (
      <ToolbarItem
        key={key}
        type="button"
        // fill
        // outline
        // title={title}
        selected={active}
        disabled={disabled}
        onMouseDown={onMouseDown}
        tooltip={{nowrap: true, renderTooltip: () => title, shortcut: shortcut}}
      >
        <Iconista set={iconSet as any} icon={icon as any} width={16} height={16} />
      </ToolbarItem>
    ),
    [],
  );

  const renderMenuItem = React.useCallback(
    (item: MenuItem) => {
      return (
        <ToolbarItem
          key={item.id ?? item.name}
          type="button"
          selected={!!item.active?.getSnapshot()}
          disabled={!!item.disabled?.getSnapshot()}
          onMouseDown={item.onSelect}
          tooltip={{nowrap: true, renderTooltip: () => item.name, shortcut: item.keys ? formatKeys(item.keys) : void 0}}
        >{item.icon?.()}</ToolbarItem>
      );
    }, []);

  return (
    <Split className={blockClass} style={{
      borderBottom: '1px solid ' + (styles.light ? styles.g(0, 0.08) : styles.g(0, 0.1)),
    }}>
      <div className={toolbarContainerClass}>
        <ToolbarMenu menu={mutxt.inline.menu.buildToolbarMenu()} pane={{transparent: true}} />
        <EmbedToolbarButton editor={editor} readOnly={readOnly} onVisualChange={onVisualChange} />
        <ToolbarSep />
        <ToolbarSep />
        <ToolbarSep line />
        <ToolbarSep />
        <ToolbarSep />
        {BLOCK_BUTTONS.map((button) => (
          renderItem({
            ...button,
            active: isBlockActive(editor, button.format!),
            disabled: readOnly,
            onMouseDown: execute(() => toggleBlock(editor, button.format!)),
          })
        ))}
        <ToolbarSep line />
        {LIST_BUTTONS.map((button) => (
          renderItem({
            ...button,
            active: isListActive(editor, button.format!),
            disabled: readOnly,
            onMouseDown: execute(() => toggleBlock(editor, button.format!)),
          })
        ))}
        <ToolbarSep line />
        {LAYOUT_BUTTONS.map((button) => (
          renderItem({
            ...button,
            active: isBlockActive(editor, button.format!),
            disabled: readOnly,
            onMouseDown: execute(() => toggleBlock(editor, button.format!)),
          })
        ))}
        <ToolbarSep />
        <ToolbarSep />
        <ToolbarSep line />
        <ToolbarSep />
        <ToolbarSep />
        {ALIGNMENT_BUTTONS.map((button) => (
          renderItem({
            ...button,
            active: isAlignmentActive(editor, button.format!),
            disabled: readOnly,
            onMouseDown: execute(() => setAlignment(editor, button.format!)),
          })
        ))}
      </div>
      <div className={toolbarContainerClass}>
        <DocumentOutlineButton editor={editor} contentWidth={300} />
        <ToolbarSep line />
        {renderMenuItem(mutxt.inline.menu.itemClear())}
        <ToolbarSep line />
        {renderItem({
          ...ACTION_BUTTONS[0],
          disabled: readOnly || !canUndo(editor),
          onMouseDown: execute(() => undo(editor)),
        })}
        {renderItem({
          ...ACTION_BUTTONS[1],
          disabled: readOnly || !canRedo(editor),
          onMouseDown: execute(() => redo(editor)),
        })}
      </div>
    </Split>
  );
};