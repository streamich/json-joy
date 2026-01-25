import * as React from 'react';
import {JsonCrdtExplorerState} from './JsonCrdtExplorerState';
import {ExplorerSidenav} from './ExplorerSidenav';
import {context} from './context';
import TwoColumnLayout from 'nice-ui/lib/6-page/TwoColumnLayout';
import {Preview} from './Preview';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {NiceUiSizes} from 'nice-ui/lib/constants';

export interface JsonCrdtExplorerProps {
  state?: JsonCrdtExplorerState;
}

export const JsonCrdtExplorer: React.FC<JsonCrdtExplorerProps> = ({state: _state}) => {
  const state = React.useMemo(() => _state || new JsonCrdtExplorerState(), [_state]);
  const files = useBehaviorSubject(state.files$);

  const content = !files.length ? (
    <div style={{display: 'flex', justifyContent: 'space-around'}}>
      <ExplorerSidenav />
    </div>
  ) : (
    <TwoColumnLayout
      left={<ExplorerSidenav />}
      right={<Preview />}
      top={NiceUiSizes.TopNavHeight + NiceUiSizes.TopNavHeight + 24}
    />
  );

  return <context.Provider value={state}>{content}</context.Provider>;
};
