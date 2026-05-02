import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {ToolbarItem} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarItem';
import {ToolbarMenu} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu';
import {AutoExpandableToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/AutoExpandableToolbar';
import {ToolbarSep} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarSep';
import type {Editor} from 'slate';
import {
  ACTION_BUTTONS,
  canRedo,
  canUndo,
  redo,
  undo,
} from '../../behavior';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {DocumentOutlineButton} from '../../chrome/DocumentOutlineButton';
import {useMuTxt} from '../../context';
import {formatKeys} from '../../util/keys';
import {SetNamedTrace} from '@jsonjoy.com/ui';
import type {MenuItem} from '../../types';

const HEIGHT = 48;

const blockClass = rule({
  pos: 'relative',
  pd: '0 32px',
  ai: 'center',
  h: HEIGHT + 'px',
  bxz: 'border-box',
  ovx: 'auto',
});

const toolbarContainerClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'center',
  h: HEIGHT + 'px',
});

export interface MuTxtHeaderProps {
  editor: Editor;
  readOnly?: boolean;
  onVisualChange: () => void;
}

export const MuTxtHeader: React.FC<MuTxtHeaderProps> = ({editor, readOnly, onVisualChange}) => {
  const mutxt = useMuTxt();
  const availableWidth = mutxt.sizer.width.use();
  const desiredWidth = mutxt.sizer.content.use();
  const styles = useStyles();
  mutxt.version.use();

  const width = Math.min(availableWidth, desiredWidth);

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

  const inlineMenu = mutxt.inline.menu.buildToolbarMenu();
  const voidsMenu = mutxt.voids.menu.buildToolbarMenu();
  const blockMenu = mutxt.block.menu.buildToolbarMenu(width > 1200 ? 2 : width > 1100 ? 1 : 0);

  return (
    <SetNamedTrace name={'subtle'} value={true}>
      <Split className={blockClass} style={{
        borderBottom: '1px solid ' + (styles.light ? styles.g(0, 0.08) : styles.g(0, 0.1)),
        padding: width < 1200 ? '0 8px' : void 0,
      }}>
        <div className={toolbarContainerClass}>
          {width > 900
           ? (
            <>
              <ToolbarMenu menu={inlineMenu} pane={{transparent: true}} />
              <ToolbarSep />
              <ToolbarSep line height={HEIGHT} lite />
              <ToolbarSep />
              <ToolbarMenu menu={voidsMenu} pane={{transparent: true}} />
              <ToolbarSep line height={HEIGHT} lite />
              <ToolbarSep />
              <AutoExpandableToolbar menu={blockMenu} pane={{transparent: true}} more={{small: true}} />
            </>
           )
           : (
            <AutoExpandableToolbar
              maxWidth={width * 0.6}
              menu={{
                ...inlineMenu,
                maxToolbarItems: inlineMenu.maxToolbarItems || inlineMenu.children!.length,
                minWidth: 288,
                children: [
                  ...inlineMenu.children!,
                  {name: 'sep-voids', sep: true},
                  ...voidsMenu.children!,
                  {name: 'sep-blocks', sep: true},
                  ...blockMenu.children!],
              }}
              pane={{transparent: true}}
              more={{small: true}}
            />
           )}
          
          
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
    </SetNamedTrace>
  );
};