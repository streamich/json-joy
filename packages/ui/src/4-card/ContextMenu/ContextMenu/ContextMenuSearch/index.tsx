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
  const openPanel = React.useMemo(() => new OpenPanelState(), []);
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
        lastPathStr = pathStr;
        const handleMouseMove = () => openPanel.onMouseMove(id);
        return (
          <React.Fragment key={id}>
            {!isFirst && !samePath && <ContextSep />}
            {!isFirst && !samePath && <ContextSep line />}
            {!isFirst && !samePath && <ContextSep />}
            {!!path.length && !samePath && <GroupTitle path={path} off={1} />}
            <ContextItemNested
              open={selected === id}
              key={pathStr + (item.id || item.name)}
              inset={inset}
              more={item.more}
              nested={!!item.children}
              icon={item.icon?.()}
              right={item.right?.()}
              danger={item.danger}
              onClick={
                item.onSelect
                  ? (event) => state.execute(item, event)
                  : children
                    ? () => {
                        state.select(path, item);
                      }
                    : void 0
              }
              renderPane={
                children
                  ? () => <ContextMenuPane {...state.props} depth={1} path={path} menu={item} showSearch={false} />
                  : void 0
              }
              onMouseEnter={handleMouseMove}
              onMouseMove={handleMouseMove}
              onMouseLeave={openPanel.onMouseLeave}
            >
              {item.display?.() ?? t(item.name)}
            </ContextItemNested>
          </React.Fragment>
        );
      });
      results = (
        <>
          <Scrollbox
            style={{
              maxHeight:
                (anchor?.maxHeight() ?? window.innerHeight) - HEIGHT.SEARCH - HEIGHT.SEPARATOR - HEIGHT.SEPARATOR,
            }}
          >
            {list}
          </Scrollbox>
          {!!list.length && <ContextSep key={'bottom-pad'} />}
        </>
      );
    }
  }

  return (
    <>
      <div style={{padding: '0 8px 8px'}}>
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
            } else {
              e.preventDefault();
              e.stopPropagation();
              try {
                (e.nativeEvent.target as any).blur?.();
              } catch {}
            }
          }}
        />
      </div>
      {results}
    </>
  );
};
