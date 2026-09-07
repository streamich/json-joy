import * as React from 'react';
import {ScrollArea, ScrollRail, Thumb, useVirtual} from '../../4-card/ScrollArea';
import {useSyncStore} from '../../hooks/useSyncStore';
import {StickyAncestors} from './components/StickyAncestors';
import {TreeRow} from './components/TreeRow';
import {rowDomId, TREE} from './constants';
import {ctx} from './context';
import {TreeState} from './state';
import {scrollerClass, treeWrapClass} from './styles';
import type {TreeHandle, TreeProps, TreeStateOpts} from './types';

const toOpts = (props: TreeProps): TreeStateOpts => ({
  roots: props.roots,
  expanded: props.expanded ?? props.defaultExpanded,
  selected: props.selected ?? props.defaultSelected,
  selection: props.selection,
  loadChildren: props.loadChildren,
  disabled: props.disabled,
  rowHeight: props.rowHeight,
  indent: props.indent,
  lines: props.lines,
  linesSwitcher: props.linesSwitcher,
  checkboxes: props.checkboxes,
  compressed: props.compressed,
  stickyAncestors: props.stickyAncestors,
  onActivate: props.onActivate,
  onContextMenu: props.onContextMenu,
  onExpandedChange: props.onExpandedChange,
  onSelectionChange: props.onSelectionChange,
  onFocusChange: props.onFocusChange,
});

/**
 * Virtualized file/data tree. Composes the headless {@link TreeState} with the
 * ScrollArea native-scroll virtualizer (uniform fixed-row-height fast path) and
 * styled rows. Expansion and selection are controlled OR uncontrolled; an
 * imperative `ref` exposes `reveal` / `expandAll` / `collapseAll` /
 * `scrollToIndex` / `flash`.
 */
export const Tree = React.forwardRef<TreeHandle, TreeProps>((props, ref) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: state is created once; props are synced via effects below.
  const state = React.useMemo(() => props.state ?? new TreeState(toOpts(props)), []);

  // Render slots are non-reactive; refresh them inline so a new render's closures win.
  state.setSlots({
    renderName: props.renderName,
    renderIcon: props.renderIcon,
    renderChevron: props.renderChevron,
    renderActions: props.renderActions,
    renderDecorations: props.renderDecorations,
    renderConnector: props.renderConnector,
    renderRowBackground: props.renderRowBackground,
  });

  React.useLayoutEffect(() => {
    state.setRoots(props.roots);
  }, [state, props.roots]);

  React.useLayoutEffect(() => {
    state.setLayout({
      rowHeight: props.rowHeight,
      indent: props.indent,
      lines: props.lines,
      linesSwitcher: props.linesSwitcher,
      checkboxes: props.checkboxes,
      compressed: props.compressed,
      stickyAncestors: props.stickyAncestors,
      selection: props.selection,
    });
  }, [
    state,
    props.rowHeight,
    props.indent,
    props.lines,
    props.linesSwitcher,
    props.checkboxes,
    props.compressed,
    props.stickyAncestors,
    props.selection,
  ]);

  // Controlled expansion / selection: sync prop to state without echoing the callback.
  React.useLayoutEffect(() => {
    if (props.expanded !== undefined) state.setExpanded(new Set(props.expanded), true);
  }, [state, props.expanded]);
  React.useLayoutEffect(() => {
    if (props.selected !== undefined) state.setSelected(new Set(props.selected), true);
  }, [state, props.selected]);

  React.useLayoutEffect(() => state.start(), [state]);

  const rows = state.rows.use();
  const rowHeight = state.rowHeight$.use();
  const focused = state.focused.use();
  const selection = state.selection$.use();
  const stickyMax = state.stickyMax$.use();
  const clientHeight = useSyncStore(state.scroll.clientHeight$);
  const overscan = props.overscan ?? TREE.Overscan;
  // Content wrapper whose translateY the sticky overlay sets to reserve its height.
  const pushRef = React.useRef<HTMLDivElement>(null);

  const v = useVirtual(state.scroll, {count: rows.length, rowHeight, overscan});
  React.useLayoutEffect(() => {
    state.setWindow(v.window);
    return () => state.setWindow(null);
  }, [state, v.window]);

  React.useImperativeHandle(
    ref,
    (): TreeHandle => ({
      reveal: state.reveal,
      flash: state.flash,
      expandAll: state.expandAll,
      collapseAll: state.collapseAll,
      scrollToIndex: state.scrollToIndex,
      focus: state.focus,
      state,
    }),
    [state],
  );

  const slice: React.ReactNode[] = [];
  for (let i = v.range.start; i <= v.range.end; i++) {
    const row = rows[i];
    if (row) slice.push(<TreeRow key={row.node.id} row={row} />);
  }

  const overflows = v.totalHeight > clientHeight;
  const canvasHeight = v.totalHeight + (stickyMax > 0 && overflows ? stickyMax * rowHeight : 0);

  return (
    <ctx.Provider value={state}>
      <ScrollArea
        state={state.scroll}
        className={props.className}
        style={{height: props.height ?? TREE.Height, ...props.style}}
      >
        <div className={treeWrapClass}>
          <div
            ref={state.setViewport}
            className={scrollerClass}
            role="tree"
            tabIndex={0}
            aria-label={props['aria-label']}
            aria-multiselectable={selection === 'multi' || undefined}
            aria-activedescendant={focused ? rowDomId(state.treeId, focused) : undefined}
            onKeyDown={state.onKeyDown}
          >
            <div style={{position: 'relative', height: canvasHeight}}>
              <div ref={pushRef}>
                <div style={{transform: `translateY(${v.offsetTop}px)`}}>{slice}</div>
              </div>
            </div>
          </div>
          {stickyMax > 0 && <StickyAncestors pushRef={pushRef} />}
        </div>
        <ScrollRail>
          <Thumb />
        </ScrollRail>
      </ScrollArea>
    </ctx.Provider>
  );
});

Tree.displayName = 'Tree';
