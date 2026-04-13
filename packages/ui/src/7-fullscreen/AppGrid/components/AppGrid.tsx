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
  left?: React.ReactNode;
  right?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  maxLeftSize?: number;
  minLeftSize?: number;
  children?: React.ReactNode;
}

export const AppGrid: React.FC<AppGridProps> = ({ state: _state, left, right, header, footer, maxLeftSize, minLeftSize, children }) => {
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
  const rightState = state.rightState.use();

  const leftElement = (leftState === 'open' && (
    <Pane className={sidebarClass} size={leftSize} minSize={minLeftSize ?? 200} maxSize={maxLeftSize}>
      {left}
    </Pane>
  ));

  const rightElement = (rightState === 'open' && (
    <Pane className={sidebarClass} size={rightSize} minSize={200}>
      {right}
    </Pane>
  ));

  let content = (
    <AppGridColumn
      header={(
        <>
          <BasicTooltip renderTooltip={() => t('Toggle sidebar')}>
            <BasicButton rounder size={32} onClick={state.toggleLeft}>
              <Iconista set="bootstrap" icon={state.leftVisible() ? 'layout-sidebar' : 'layout-sidebar-inset'} width={16} height={16} style={{opacity: .7}} />
            </BasicButton>
          </BasicTooltip>
          {header}
        </>
      )}
      footer={footer}
    >
      {children}
    </AppGridColumn>
  );

  if (!!leftElement || !!rightElement) {
    content = (
      <SplitPane
        className={outerClass}
        onResize={state.setSizes}
        divider={SlimDivider}
        dividerSize={12}
      >
        {leftElement}
        <Pane minSize={200}>
          {/* <div style={{paddingRight: 2}}>
            {content}
          </div> */}
          {content}
        </Pane>
        {rightElement}
      </SplitPane>
    );
  }
  
  return (
    <ctx.Provider value={state}>
      <div className={outerClass}>
        {content}
      </div>
    </ctx.Provider>
  );
};
