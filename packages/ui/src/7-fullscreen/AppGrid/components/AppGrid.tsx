import * as React from 'react';
import useMedia from 'react-use/lib/useMedia';
import {Pane, SplitPane} from '../../../5-block/SplitPane';
import {SlimDivider} from '../../../5-block/SplitPane/components/SlimDivider';
import {rule} from 'nano-theme';
import {AppGridState} from '../state';
import {ctx} from '../context';
import {Iconista} from '../../../icons/Iconista';
import BasicButton from '../../../2-inline-block/BasicButton';
import {useT} from 'use-t';
import {BasicTooltip} from '../../../4-card/BasicTooltip';
import {OverlayDrawer} from '../../../5-block/Drawer/components/OverlayDrawer';
import {AppGridColumn} from './AppGridColumn';

const DEFAULT_OVERLAY_BREAKPOINT = '(max-width: 768px)';

const outerClass = rule({
  w: '100vw',
  h: '100vh',
  ov: 'hidden',
});

const sidebarClass = rule({
  h: '100vh',
  ov: 'hidden',
});

export interface AppGridProps {
  state?: AppGridState;
  left?: React.ReactNode | ((toggle: React.ReactNode) => React.ReactNode);
  right?: React.ReactNode;
  header?: React.ReactNode | ((toggle: React.ReactNode) => React.ReactNode);
  footer?: React.ReactNode;
  scrollHeader?: React.ReactNode;
  scrollFooter?: React.ReactNode;
  maxLeftSize?: number;
  minLeftSize?: number;
  /** Media query that triggers overlay-drawer mode for the sidebars. */
  overlayBreakpoint?: string;
  children?: React.ReactNode;

  /** Render the column yourself. */
  column?: (toggle: React.ReactNode) => React.ReactNode;
}

export const AppGrid: React.FC<AppGridProps> = ({
  state: _state,
  left,
  right,
  header,
  footer,
  scrollHeader,
  scrollFooter,
  maxLeftSize,
  minLeftSize,
  overlayBreakpoint = DEFAULT_OVERLAY_BREAKPOINT,
  children,
  column,
}) => {
  const [t] = useT();
  const hasLeft = !!left;
  const hasRight = !!right;
  // biome-ignore lint/correctness/useExhaustiveDependencies: overlayBreakpoint only consulted on initial state creation; should not recreate state when it changes
  const state = React.useMemo(() => {
    if (_state) return _state;
    const s = new AppGridState();
    if (typeof window !== 'undefined' && window.matchMedia(overlayBreakpoint).matches) {
      s.leftState.next('close');
      s.rightState.next('close');
    }
    return s;
  }, [_state]);
  const leftSize = state.leftSize.use();
  const rightSize = state.rightSize.use();
  const leftState = state.leftState.use();
  const leftVisible = state.leftVisible();
  const rightVisible = state.rightVisible();
  const isSmall = useMedia(overlayBreakpoint);
  const showAsOverlay = isSmall && (hasLeft || hasRight);
  React.useEffect(() => {
    state.overlay.next(showAsOverlay);
  }, [state, showAsOverlay]);

  const toggle = (
    <BasicTooltip renderTooltip={() => (leftVisible ? t('Close sidebar') : t('Open sidebar'))}>
      <BasicButton rounder size={32} onClick={state.toggleLeft}>
        <Iconista
          set="bootstrap"
          icon={leftVisible ? 'layout-sidebar' : 'layout-sidebar-inset'}
          width={16}
          height={16}
          style={{opacity: 0.7}}
        />
      </BasicButton>
    </BasicTooltip>
  );

  const leftElement = hasLeft && (
    <Pane
      hidden={!leftVisible}
      className={sidebarClass}
      size={leftSize}
      minSize={minLeftSize ?? 200}
      maxSize={maxLeftSize}
    >
      {typeof left === 'function' ? left(toggle) : left}
    </Pane>
  );

  const rightElement = hasRight && (
    <Pane hidden={!rightVisible} className={sidebarClass} size={rightSize} minSize={200}>
      {right}
    </Pane>
  );

  let content = column ? (
    column(showAsOverlay || !leftVisible ? toggle : null)
  ) : (
    <AppGridColumn
      header={
        typeof left === 'function' && leftState === 'open' && !showAsOverlay ? (
          typeof header === 'function' ? (
            header(null)
          ) : (
            header
          )
        ) : (
          <>
            {typeof header === 'function' ? null : toggle}
            {typeof header === 'function' ? header(toggle) : header}
          </>
        )
      }
      footer={footer}
      scrollHeader={scrollHeader}
      scrollFooter={scrollFooter}
    >
      {children}
    </AppGridColumn>
  );

  if (showAsOverlay) {
    const leftDrawer = hasLeft && (
      <OverlayDrawer
        open={leftVisible}
        side="left"
        width={leftSize}
        onOpenChange={(open) => {
          if (!open) state.leftState.next('close');
        }}
      >
        {typeof left === 'function' ? left(toggle) : left}
      </OverlayDrawer>
    );
    const rightDrawer = hasRight && (
      <OverlayDrawer
        open={rightVisible && !leftVisible}
        side="right"
        width={rightSize}
        onOpenChange={(open) => {
          if (!open) state.rightState.next('close');
        }}
      >
        {right}
      </OverlayDrawer>
    );
    content = (
      <>
        {content}
        {leftDrawer}
        {rightDrawer}
      </>
    );
  } else if (hasLeft || hasRight) {
    content = (
      <SplitPane className={outerClass} onResize={state.setSizes} divider={SlimDivider} dividerSize={12}>
        {leftElement}
        <Pane minSize={200}>{content}</Pane>
        {rightElement}
      </SplitPane>
    );
  }

  return (
    <ctx.Provider value={state}>
      <div className={outerClass}>{content}</div>
    </ctx.Provider>
  );
};
