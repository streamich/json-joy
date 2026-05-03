import * as React from 'react';
import {useT} from 'use-t';
import {useContextMenu} from '../context';
import {useBehaviorSubject} from '../../../../hooks/useBehaviorSubject';
import {Input} from '../../../../2-inline-block/Input';
import {SYMBOL} from 'nano-theme';
import {BasicButtonClose} from '../../../../2-inline-block/BasicButton/BasicButtonClose';
import {EmptyState} from '../../../EmptyState';
import {ContextItemNested} from '../../ContextItemNested';
import {GroupTitle} from './GroupTitle';
import {ContextSep} from '../../ContextSep';
import {OpenPanelState} from '../OpenPanelState';
import {Scrollbox} from '../../../Scrollbox';
import {useAnchorPoint} from '../../../../utils/popup';
import type {ContextMenuPaneProps} from '../ContextMenuPane';

enum HEIGHT {
  SEARCH = 45,
  SEPARATOR = 7,
}

export interface ContextMenuSearchProps {
  inset?: boolean;
  ContextMenuPane: React.FC<ContextMenuPaneProps>;
}

export const ContextMenuSearch: React.FC<ContextMenuSearchProps> = ({inset, ContextMenuPane}) => {
  const [t] = useT();
  const state = useContextMenu();
  const search = useBehaviorSubject(state.search$);
  const matches = useBehaviorSubject(state.matches$);
  const anchor = useAnchorPoint();
  const openPanel = React.useMemo(() => new OpenPanelState({armed: true}), []);
  const selected = useBehaviorSubject(openPanel.selected$);

  let results: React.ReactNode = null;

  if (search) {
    if (!matches || !matches.length) {
      results = <EmptyState emoji={' '} />;
    } else {
      let lastPathStr: string = '';
      const list = matches.map(({item, path}, index) => {
        const pathStr = path.map((item) => item.id ?? item.name).join('/');
        const samePath = pathStr === lastPathStr;
        const isFirst = index === 0;
        const children = item.children;
        const id = item.id ?? item.name;
        const compositeId = pathStr ? pathStr + '/' + id : id;
        lastPathStr = pathStr;
        const handleMouseMove = () => openPanel.onMouseMove(compositeId);
        const isOpen = selected === compositeId;
        const hasArgs = !!item.params?.length;
        return (
          <React.Fragment key={compositeId}>
            {!isFirst && !samePath && <ContextSep />}
            {!isFirst && !samePath && <ContextSep line />}
            {!isFirst && !samePath && <ContextSep />}
            {!!path.length && !samePath && <GroupTitle path={path} off={1} />}
            <div data-menu-row data-menu-id={compositeId}>
              <ContextItemNested
                open={isOpen}
                key={pathStr + (item.id || item.name)}
                inset={inset}
                more={item.more}
                nested={!!item.children}
                icon={item.icon?.()}
                right={item.right?.()}
                danger={item.danger}
                mono={item.mono}
                onClick={
                  hasArgs
                    ? () => {
                        state.selectArgs(path, item);
                      }
                    : item.onSelect
                      ? (event) => state.execute(item, event)
                      : children
                        ? () => {
                            state.select(path, item);
                          }
                        : void 0
                }
                renderPane={
                  children
                    ? () => (
                        <ContextMenuPane
                          {...state.props}
                          depth={1}
                          path={path}
                          menu={item}
                          showSearch={false}
                          onEsc={() => openPanel.deselect()}
                        />
                      )
                    : void 0
                }
                onMouseEnter={handleMouseMove}
                onMouseMove={handleMouseMove}
                onMouseLeave={openPanel.onMouseLeave}
                role="menuitem"
                tabIndex={-1}
                aria-haspopup={children ? 'menu' : undefined}
                aria-expanded={children ? isOpen : undefined}
              >
                {item.display?.() ?? t(item.name)}
              </ContextItemNested>
            </div>
          </React.Fragment>
        );
      });
      const handleResultKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight') {
          const row = (e.target as HTMLElement).closest?.('[data-menu-row]');
          const menuId = row?.getAttribute('data-menu-id');
          if (menuId) {
            e.preventDefault();
            e.stopPropagation();
            openPanel.forceSelect(menuId);
          }
        } else if (e.key === 'ArrowLeft') {
          if (openPanel.deselect()) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      };
      results = (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div onKeyDown={handleResultKeyDown}>
          <Scrollbox
            style={{
              maxHeight:
                (anchor?.maxHeight() ?? window.innerHeight) - HEIGHT.SEARCH - HEIGHT.SEPARATOR - HEIGHT.SEPARATOR,
            }}
          >
            {list}
          </Scrollbox>
          {!!list.length && <ContextSep key={'bottom-pad'} />}
        </div>
      );
    }
  }

  return (
    <>
      <div data-menu-row style={{padding: '0 8px 8px'}}>
        <Input
          focus
          size={-2}
          placeholder={t('Find action') + ' ' + SYMBOL.ELLIPSIS}
          right={search ? <BasicButtonClose onClick={() => state.search$.next('')} /> : void 0}
          value={search}
          onChange={(value) => state.search$.next(value)}
          onEsc={(e) => {
            if (state.search$.getValue()) {
              e.preventDefault();
              e.stopPropagation();
              state.search$.next('');
            }
            // When search is empty, let the event bubble to the container's
            // keyboard handler (breadcrumb back-navigation → close menu).
          }}
        />
      </div>
      {results}
    </>
  );
};
