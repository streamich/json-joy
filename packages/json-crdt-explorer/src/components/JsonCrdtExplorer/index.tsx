import * as React from 'react';
import {JsonCrdtExplorerState} from './state';
import {ExplorerSidenav} from './ExplorerSidenav';
import {context} from './context';
import TwoColumnLayout from '@jsonjoy.com/ui/lib/6-page/TwoColumnLayout';
import {Preview} from './Preview';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';

export interface JsonCrdtExplorerProps {
  state?: JsonCrdtExplorerState;
  top?: number;
}

export const JsonCrdtExplorer: React.FC<JsonCrdtExplorerProps> = ({state: _state, top = 0}) => {
  const state = React.useMemo(() => _state || new JsonCrdtExplorerState(), [_state]);
  const files = useBehaviorSubject(state.files$);

  const content = !files.length ? (
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      <ExplorerSidenav />
    </div>
  ) : (
    <TwoColumnLayout left={<ExplorerSidenav />} right={<Preview />} top={top} />
  );

  return <context.Provider value={state}>{content}</context.Provider>;
};
