import * as React from 'react';
import {useT} from 'use-t';
import {ContextSep} from '../ContextSep';
import {ContextPane, type ContextPaneProps} from '../ContextPane';
import {useContextMenu} from './context';
import {ContextMenuHeader} from './ContextMenuHeader';
import {ContextMenuSearch} from './ContextMenuSearch';
import {useBehaviorSubject} from '../../../hooks/useBehaviorSubject';
import {OpenPanelState} from './OpenPanelState';
import {ExpandSection} from './ExpandSection';
import {ContextHeader} from '../ContextHeader';
import {Breadcrumb} from '../../../3-list-item/Breadcrumbs';
import {bigIconsState, line} from './util';
import {Scrollbox} from '../../Scrollbox';
import {useAnchorPoint} from '../../../utils/popup';
import {ContextMenuToolbarRow} from './ContextMenuToolbarRow';
import {ContextMenuItem} from './ContextMenuItem';
import {ContextPaneHeaderSep} from '../ContextPaneHeaderSep';
import {MoveToViewport} from '../../../utils/popup/MoveToViewport';
import type {MenuItem} from '../../StructuralMenu/types';

const enum HEIGHT {
  HEADER = 40,
  SEARCH = 45,
  SEPARATOR = 7,
}

export interface ContextMenuPaneProps {
  menu: MenuItem;
  path?: MenuItem[];

  /**
   * Panel rendering depth, i.e. tracks the number of nested visible panels.
   * Starts from `0`, where `0` is the root panel.
   */
  depth?: number;

  inset?: boolean;
  pane?: ContextPaneProps;
  showSearch?: boolean;
  header?: React.ReactNode;

  onEsc?: () => void;
}

export const ContextMenuPane: React.FC<ContextMenuPaneProps> = (props) => {
  const {menu, path = [], depth = 0, inset, pane, showSearch, header, onEsc} = props;
  const [t] = useT();
  const state = useContextMenu();
  const search = useBehaviorSubject(state.search$);
  // biome-ignore lint/correctness/useExhaustiveDependencies: depth is only consulted at initial state creation; should not recreate the panel state
  const openPanel = React.useMemo(() => new OpenPanelState({armed: depth > 0}), []);
  React.useEffect(openPanel.start, []);
  const selected = useBehaviorSubject(openPanel.selected$);
  const anchor = useAnchorPoint();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const doShowSearch = showSearch && !depth && !path.length;

  // Auto-focus first item on mount.
  React.useEffect(() => {
    if (depth > 0) {
      // Popup panes are inside MoveToViewport which starts visibility:hidden
      // and reveals via requestAnimationFrame. Delay focus to run after that.
      let inner: number;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => {
          state.focusFirstItem(containerRef.current, false, depth);
        });
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    state.focusFirstItem(containerRef.current, doShowSearch, depth);
    return undefined;
  }, [depth, doShowSearch, state.focusFirstItem]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (search && openPanel.selected$.getValue()) openPanel.deselect();
  }, [search, openPanel]);

  if (menu.pane) {
    return <>{menu.pane()}</>;
  }

  const children = menu.children;
  const hasRaw = !!menu.raw;
  if (!children && !hasRaw) return null;

  const length = children?.length ?? 0;
  const nodes: React.ReactNode[] = [];

  const bigIcons = bigIconsState(nodes, menu);

  const renderItem = (item: MenuItem): React.ReactNode => {
    if (!bigIcons.flushed()) {
      if (item.iconBig) {
        bigIcons.push(item);
        return;
      } else bigIcons.flush();
    }
    const id = item.id ?? item.name;
    return (
      <ContextMenuItem
        key={id}
        item={item}
        path={[...path, menu]}
        parent={menu}
        open={selected === id}
        openPanel={openPanel}
        renderPane={() => (
          <MoveToViewport>
            <ContextMenuPane
              {...props}
              header={void 0}
              path={[...path, menu]}
              depth={depth + 1}
              menu={item}
              onEsc={() => openPanel.deselect()}
            />
          </MoveToViewport>
        )}
      />
    );
  };

  for (let i = 0; i < length; i++) {
    const child = children![i];
    if (child.sep || child.sepBefore) {
      bigIcons.flush();
      const key = child.id ?? child.name;
      nodes.push(line(key));
      if (!child.sepBefore) continue;
    }
    const subChildren = child.children;
    const expand = child.expand;
    if (expand && !!subChildren && !!subChildren.length) {
      bigIcons.flush();
      const id = (child.id ?? child.name) + '-title';
      nodes.push(
        <ExpandSection
          key={id}
          path={path}
          menu={menu}
          child={child}
          open={id === selected}
          renderItem={renderItem}
          renderPane={(item) => (
            <MoveToViewport>
              <ContextMenuPane
                {...props}
                path={[...path, menu]}
                depth={depth + 1}
                menu={item}
                onEsc={() => openPanel.deselect()}
                header={
                  <>
                    <ContextHeader compact>
                      <Breadcrumb compact>{t(child.name)}</Breadcrumb>
                    </ContextHeader>
                    <ContextPaneHeaderSep />
                  </>
                }
              />
            </MoveToViewport>
          )}
          onTitleMouseEnter={() => openPanel.onMouseMove(id)}
          onTitleMouseMove={() => openPanel.onMouseMove(id)}
          onTitleMouseLeave={openPanel.onMouseLeave}
        />,
      );
    } else {
      if (typeof child.expandChild === 'number') {
        const item = child.children?.[child.expandChild];
        const id = child.id ?? child.name;
        if (item)
          nodes.push(
            <ContextMenuToolbarRow
              key={id}
              path={[...path, menu, child, item]}
              depth={depth + 1}
              openPanel={openPanel}
            />,
          );
      } else {
        nodes.push(renderItem(child));
      }
    }
  }

  bigIcons.flush(false);

  const searchHeight = doShowSearch ? HEIGHT.SEARCH : 0;
  const doShowHeader = !depth && !!path.length;
  const headerHeight = doShowHeader || !!header ? HEIGHT.HEADER : 0;

  const minWidth = menu.minWidth ?? state.minWidth ?? 220;
  const paneStyle = pane?.style ?? {};
  paneStyle.minWidth = minWidth;
  if (menu.maxWidth !== undefined) {
    paneStyle.maxWidth = menu.maxWidth;
    paneStyle.width = menu.maxWidth;
  }

  return (
    <ContextPane
      {...pane}
      ref={containerRef}
      role="menu"
      aria-label={menu.name}
      onKeyDown={(e) => state.handleKeyDown(e, containerRef.current, openPanel, depth, onEsc)}
      onBlur={(e) => state.handleFocusOut(e, containerRef.current, depth, onEsc)}
      style={paneStyle}
    >
      {!doShowHeader && header}
      {(!search || !showSearch) && (
        <>
          {doShowHeader && <ContextMenuHeader />}
          <ContextSep />
          <Scrollbox
            style={{
              maxHeight:
                (anchor?.maxHeight() ?? window.innerHeight) -
                searchHeight -
                headerHeight -
                HEIGHT.SEPARATOR -
                HEIGHT.SEPARATOR,
            }}
          >
            {hasRaw ? menu.raw!() : nodes}
          </Scrollbox>
        </>
      )}
      <ContextSep />
      {doShowSearch && <ContextMenuSearch inset={inset} ContextMenuPane={ContextMenuPane} />}
    </ContextPane>
  );
};
