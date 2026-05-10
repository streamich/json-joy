import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {ToolbarMenu} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu';
import {AutoExpandableToolbar} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarMenu/AutoExpandableToolbar';
import {ToolbarSep} from '@jsonjoy.com/ui/lib/4-card/Toolbar/ToolbarSep';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {DocumentOutlineButton} from '../../chrome/DocumentOutlineButton';
import {useMuTxt} from '../../context';
import {SetNamedTrace} from '@jsonjoy.com/ui';
import type {Editor} from 'slate';

const HEIGHT = 48;

const blockClass = rule({
  pos: 'relative',
  pd: '0 32px',
  ai: 'center',
  h: HEIGHT + 'px',
  bxz: 'border-box',
});

const toolbarContainerClass = rule({
  d: 'flex',
  fld: 'row',
  ai: 'center',
  h: HEIGHT + 'px',
});

export interface MuTxtHeaderProps {
  editor: Editor;
}

export const MuTxtHeader: React.FC<MuTxtHeaderProps> = ({editor}) => {
  const mutxt = useMuTxt();
  const availableWidth = mutxt.sizer.width.use();
  const desiredWidth = mutxt.sizer.content.use();
  const styles = useStyles();
  mutxt.version.use();

  const width = Math.min(availableWidth, desiredWidth);

  const inlineMenu = mutxt.inline.menu.buildToolbarMenu();
  const voidsMenu = mutxt.voids.menu.buildToolbarMenu();
  const blockMenu = mutxt.block.menu.buildToolbarMenu(width > 1300 ? 2 : width > 1200 ? 1 : 0);

  return (
    <SetNamedTrace name={'subtle'} value={true}>
      <Split
        className={blockClass}
        style={{
          borderBottom: '1px solid ' + (styles.light ? styles.g(0, 0.08) : styles.g(0, 0.1)),
          padding: width < 1200 ? '0 8px' : void 0,
        }}
      >
        <div className={toolbarContainerClass}>
          {width > 900 ? (
            <>
              <ToolbarMenu menu={inlineMenu} pane={{transparent: true, inline: true}} />
              <ToolbarSep />
              <ToolbarSep line height={HEIGHT - 1} lite />
              <ToolbarSep />
              <ToolbarMenu menu={voidsMenu} pane={{transparent: true, inline: true}} />
              <ToolbarSep line height={HEIGHT - 1} lite />
              <ToolbarSep />
              <AutoExpandableToolbar menu={blockMenu} pane={{transparent: true, inline: true}} more={{small: true}} />
            </>
          ) : (
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
                  ...blockMenu.children!,
                ],
              }}
              pane={{transparent: true, inline: true}}
              more={{small: true}}
            />
          )}
        </div>
        <div className={toolbarContainerClass}>
          <DocumentOutlineButton editor={editor} contentWidth={300} />
          <ToolbarSep line />
          <ToolbarMenu
            pane={{transparent: true, inline: true}}
            menu={mutxt.docMenu.buildHeaderToolbar(
              width > 1500 ? 5 : width > 1400 ? 4 : width > 1300 ? 3 : width > 1200 ? 2 : width > 1100 ? 1 : 0,
            )}
          />
        </div>
      </Split>
    </SetNamedTrace>
  );
};
