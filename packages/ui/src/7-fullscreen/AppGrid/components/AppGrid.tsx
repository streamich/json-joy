import * as React from 'react';
import {Pane, SplitPane} from '../../../5-block/SplitPane';
import {rule} from 'nano-theme';
import {SlimDivider} from '../../../5-block/SplitPane/components/SlimDivider';
import {AppGridState} from '../state';
import {ctx} from '../context';
import {Iconista} from '../../../icons/Iconista';
import BasicButton from '../../../2-inline-block/BasicButton';
import {useT} from 'use-t';
import {BasicTooltip} from '../../../4-card/BasicTooltip';
import {AppGridColumn} from './AppGridColumn';

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
  children?: React.ReactNode;
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
  children,
}) => {
  const [t] = useT();
  const hasLeft = !!left;
  const hasRight = !!right;
  const state = React.useMemo(() => {
    const s = _state || new AppGridState();
    return s;
  }, [_state, hasLeft, hasRight]);
  const leftSize = state.leftSize.use();
  const rightSize = state.rightSize.use();
  const leftState = state.leftState.use();
  const leftVisible = state.leftVisible();
  const rightVisible = state.rightVisible();

  const toggle = (
    <BasicTooltip renderTooltip={() => t('Toggle sidebar')}>
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

  let content = (
    <AppGridColumn
      header={
        typeof left === 'function' && leftState === 'open' ? (
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

  if (hasLeft || hasRight) {
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
