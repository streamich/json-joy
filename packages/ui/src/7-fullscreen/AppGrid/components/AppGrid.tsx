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
import {AppGridFooter} from './AppGridFooter';
import {AppGridColumn} from './AppGridColumn';

const outerClass = rule({
  w: '100vw',
  h: '100vh',
  ov: 'hidden',
});

const sidebarClass = rule({
  bg: 'rgba(0,0,0,0.01)',
  h: '100vh',
  ov: 'hidden',
});

export interface AppGridProps {
  state?: AppGridState;
  left?: React.ReactNode;
  right?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export const AppGrid: React.FC<AppGridProps> = ({ state: _state, left, right, header, footer, children }) => {
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
    <Pane className={sidebarClass} size={leftSize} minSize={200}>
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
            <BasicButton onClick={state.toggleLeft}>
              <Iconista set="bootstrap" icon="layout-sidebar" width={16} height={16} />
            </BasicButton>
          </BasicTooltip>
          {header}
        </>
      )}
      footer={!!footer && (
        <AppGridFooter>
          {footer}
        </AppGridFooter>
      )}
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
        <Pane minSize={200}>{content}</Pane>
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
