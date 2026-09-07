import * as React from 'react';
import {useT} from 'use-t';
import {useContextMenu} from '../context';
import {useBehaviorSubject} from '../../../../hooks/useBehaviorSubject';
import {Input} from '../../../../2-inline-block/Input';
import {SYMBOL} from 'nano-theme';
import {BasicButtonClose} from '../../../../2-inline-block/BasicButton/BasicButtonClose';
import {EmptyState} from '../../../EmptyState';
import {ContextItemNested} from '../../ContextItemNested';
import {Highlight} from '../../../../1-inline/Highlight';
import {GroupTitle} from './GroupTitle';
import {ContextSep} from '../../ContextSep';
import {OpenPanelState} from '../OpenPanelState';
import {Scrollbox} from '../../../Scrollbox';
import {useAnchorPoint} from '../../../../utils/popup';
import {MoveToViewport} from '../../../../utils/popup/MoveToViewport';
import type {ContextMenuPaneProps} from '../ContextMenuPane';

enum HEIGHT {
  SEARCH = 45,
  SEARCH_LABEL = 28,
  SEPARATOR = 7,
}

export interface ContextMenuSearchProps {
  inset?: boolean;
  searchPlaceholder?: string;
  searchLabel?: boolean | string;
  ContextMenuPane: React.FC<ContextMenuPaneProps>;
}

export const ContextMenuSearch: React.FC<ContextMenuSearchProps> = ({
  inset,
  searchPlaceholder,
  searchLabel,
  ContextMenuPane,
}) => {
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
      const queryTokens = search
        .toLowerCase()
        .split(/\s+/)
        .filter((s) => s.length > 0);
      let lastPathStr: string = '';
      const list = matches.map(({item, path}, index) => {
        const pathStr = path.map((item) => item.id ?? item.name).join('/');
        const samePath = pathStr === lastPathStr;
        const isFirst = index === 0;
        const children = item.children;
        const hasPane = !!item.pane;
        const hasRaw = !!item.raw;
        const navigable = !!children || hasPane || hasRaw;
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
                nested={navigable}
                icon={item.icon?.()}
                right={item.right?.()}
                danger={item.danger}
                mono={item.mono}
                onClick={
                  hasArgs
                    ? () => {
                        state.selectArgs(path, item);
                      }
                    : hasPane || hasRaw
                      ? () => {
                          state.select(path, item);
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
                  navigable
                    ? () => (
                        <MoveToViewport>
                          <ContextMenuPane
                            {...state.props}
                            depth={1}
                            path={path}
                            menu={item}
                            showSearch={false}
                            onEsc={() => openPanel.deselect()}
                          />
                        </MoveToViewport>
                      )
                    : void 0
                }
                onMouseEnter={handleMouseMove}
                onMouseMove={handleMouseMove}
                onMouseLeave={openPanel.onMouseLeave}
                role="menuitem"
                tabIndex={-1}
                aria-haspopup={navigable ? 'menu' : undefined}
                aria-expanded={navigable ? isOpen : undefined}
              >
                {item.display ? (
                  item.display()
                ) : (
                  <span>
                    <Highlight text={t(item.name)} query={queryTokens} />
                  </span>
                )}
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
                (anchor?.maxHeight() ?? window.innerHeight) -
                HEIGHT.SEARCH -
                (searchLabel ? HEIGHT.SEARCH_LABEL : 0) -
                HEIGHT.SEPARATOR -
                HEIGHT.SEPARATOR,
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
          label={searchLabel ? (typeof searchLabel === 'string' ? searchLabel : t('Search')) : void 0}
          size={-2}
          placeholder={searchPlaceholder ?? t('Find') + SYMBOL.ELLIPSIS}
          right={
            search ? <BasicButtonClose style={{marginRight: -4}} onClick={() => state.search$.next('')} /> : void 0
          }
          value={search}
          onChange={(value) => state.search$.next(value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !state.search$.getValue()) {
              e.preventDefault();
              e.stopPropagation();
              state.onclose?.();
            }
          }}
          onEnter={(e) => {
            if (!state.search$.getValue()) return;
            const top = state.matches$.getValue()?.[0];
            if (!top) return;
            e.preventDefault();
            e.stopPropagation();
            const {item, path} = top;
            if (item.params?.length) state.selectArgs(path, item);
            else if (item.pane || item.raw || item.children) state.select(path, item);
            else if (item.onSelect) state.execute(item, e as unknown as React.MouseEvent);
          }}
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
