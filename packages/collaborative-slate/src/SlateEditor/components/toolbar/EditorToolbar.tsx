import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {ToolbarItem} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarItem';
import {ToolbarPane} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarPane';
import {ToolbarSep} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarSep';
import type {Editor} from 'slate';
import {
  ACTION_BUTTONS,
  ALIGNMENT_BUTTONS,
  BLOCK_BUTTONS,
  LIST_BUTTONS,
  MARK_BUTTONS,
  canRedo,
  canUndo,
  clearFormatting,
  isAlignmentActive,
  isBlockActive,
  isListActive,
  isMarkActive,
  redo,
  setAlignment,
  toggleBlock,
  toggleMark,
  undo,
} from '../../behavior';

const toolbarClass = rule({
  // pd: '8px',
});

const iconWrapClass = rule({
  // d: 'inline-flex',
  // ai: 'center',
  // jc: 'center',
});

const toolbarContainerClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'center',
  // pd: '16px',
  // pd: '10px 16px 8px',
  // pd: '8px 24px',
  pd: '8px 32px',
  h: '32px',
});

export interface EditorToolbarProps {
  editor: Editor;
  readOnly?: boolean;
  onVisualChange: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({editor, readOnly, onVisualChange}) => {
  const styles = useStyles();

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

  const getIconColor = React.useCallback(
    (active?: boolean, disabled?: boolean): string => {
      if (disabled) return styles.light ? styles.g(0.55) : styles.g(0.5);
      if (active) return '#fff';
      return styles.light ? styles.g(0.18) : styles.g(0.9);
    },
    [styles],
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
        title={title}
        selected={active}
        disabled={disabled}
        onMouseDown={onMouseDown}
        tooltip={{nowrap: true, renderTooltip: () => title, shortcut: shortcut}}
      >
        <Iconista set={iconSet as any} icon={icon as any} width={16} height={16} />
      </ToolbarItem>
    ),
    [getIconColor],
  );

  const style: React.CSSProperties = {
    borderBottom: '1px solid ' + (styles.light ? styles.g(0, 0.08) : styles.g(0, 0.1)),
  };

  return (
    <div className={toolbarClass}>
      <div className={toolbarContainerClass} style={style}>
        {MARK_BUTTONS.map((button) => (
          renderItem({
            key: button.key,
            title: button.title,
            iconSet: button.iconSet,
            icon: button.icon,
            shortcut: button.shortcut,
            active: isMarkActive(editor, button.format!),
            disabled: readOnly,
            onMouseDown: execute(() => toggleMark(editor, button.format!)),
          })
        ))}
        <ToolbarSep />
        <ToolbarSep />
        <ToolbarSep line />
        <ToolbarSep />
        <ToolbarSep />
        {BLOCK_BUTTONS.map((button) => (
          renderItem({
            key: button.key,
            title: button.title,
            iconSet: button.iconSet,
            icon: button.icon,
            shortcut: button.shortcut,
            active: isBlockActive(editor, button.format!),
            disabled: readOnly,
            onMouseDown: execute(() => toggleBlock(editor, button.format!)),
          })
        ))}
        <ToolbarSep line />
        {LIST_BUTTONS.map((button) => (
          renderItem({
            key: button.key,
            title: button.title,
            iconSet: button.iconSet,
            icon: button.icon,
            shortcut: button.shortcut,
            active: isListActive(editor, button.format!),
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
            key: button.key,
            title: button.title,
            iconSet: button.iconSet,
            icon: button.icon,
            shortcut: button.shortcut,
            active: isAlignmentActive(editor, button.format!),
            disabled: readOnly,
            onMouseDown: execute(() => setAlignment(editor, button.format!)),
          })
        ))}
        <ToolbarSep />
        <ToolbarSep />
        <ToolbarSep line />
        <ToolbarSep />
        <ToolbarSep />
        {renderItem({
          key: ACTION_BUTTONS[0].key,
          title: ACTION_BUTTONS[0].title,
          iconSet: ACTION_BUTTONS[0].iconSet,
          icon: ACTION_BUTTONS[0].icon,
          shortcut: ACTION_BUTTONS[0].shortcut,
          disabled: readOnly || !canUndo(editor),
          onMouseDown: execute(() => undo(editor)),
        })}
        {renderItem({
          key: ACTION_BUTTONS[1].key,
          title: ACTION_BUTTONS[1].title,
          iconSet: ACTION_BUTTONS[1].iconSet,
          icon: ACTION_BUTTONS[1].icon,
          shortcut: ACTION_BUTTONS[1].shortcut,
          disabled: readOnly || !canRedo(editor),
          onMouseDown: execute(() => redo(editor)),
        })}
        <ToolbarSep line />
        {renderItem({
          key: ACTION_BUTTONS[2].key,
          title: ACTION_BUTTONS[2].title,
          iconSet: ACTION_BUTTONS[2].iconSet,
          icon: ACTION_BUTTONS[2].icon,
          disabled: readOnly,
          onMouseDown: execute(() => clearFormatting(editor)),
        })}
      </div>
    </div>
  );
};