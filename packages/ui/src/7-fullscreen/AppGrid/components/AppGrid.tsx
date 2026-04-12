import * as React from 'react';
import {Pane, SplitPane} from '../../../5-block/SplitPane';
import {rule} from 'nano-theme';
import {AppGridHeader} from './AppGirdHeader';
import {SlimDivider} from '../../../5-block/SplitPane/components/SlimDivider';
import {AppGridState} from '../state';
import {ctx} from '../context';
import {Iconista} from '../../../icons/Iconista';
import BasicButton from '../../../2-inline-block/BasicButton';
import {useT} from 'use-t';
import {BasicTooltip} from '../../../4-card/BasicTooltip';
import {AppGridFooter} from './AppGridFooter';

const blockClass = rule({
  w: '100vw',
  h: '100vh',
});

const sidebarClass = rule({
  bg: 'rgba(0,0,0,0.01)',
  h: '100vh',
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
  const leftPanel = state.leftState.use();

  const leftElement = (leftPanel === 'open' && (
    <Pane className={sidebarClass} size={leftSize} minSize={200}>
      {left}
    </Pane>
  ));

  const rightElement = (rightSize > 0 && (
    <Pane className={sidebarClass} size={rightSize} minSize={200}>
      {right}
    </Pane>
  ));

  let content = (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <AppGridHeader>
        <BasicTooltip renderTooltip={() => t('Toggle sidebar')}>
          <BasicButton onClick={state.toggleLeft}>
            <Iconista set="bootstrap" icon="layout-sidebar" width={16} height={16} />
          </BasicButton>
        </BasicTooltip>
        {header}
      </AppGridHeader>
      <div style={{flex: 1, overflow: 'auto'}}>{children}</div>
      {!!footer && (
        <AppGridFooter>
          {footer}
        </AppGridFooter>
      )}
    </div>
  );

  content = (
    <SplitPane
      className={blockClass}
      onResize={state.setSizes}
      snapTolerance={15}
      divider={SlimDivider}
      dividerSize={1}
    >
      {leftElement}
      <Pane minSize={200}>{content}</Pane>
      {rightElement}
    </SplitPane>
  );

  return (
    <ctx.Provider value={state}>
      <div className={blockClass}>
        {content}
      </div>
    </ctx.Provider>
  );
};
