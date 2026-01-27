import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {context, useSideBySideSyncState} from './context';
import {SideBySideSyncState} from './SideBySideSyncState';
import {JsonCrdtModel, JsonCrdtModelProps} from '../JsonCrdtModel';
import {TopBar} from './TopBar';
import type {Model} from 'json-joy/lib/json-crdt';

export interface SideBySideSyncProps {
  model: Model<any>;
  renderDisplay?: JsonCrdtModelProps['renderDisplay'];
}

export const SideBySideSync: React.FC<SideBySideSyncProps> = ({model, ...rest}) => {
  const state = React.useMemo(() => new SideBySideSyncState(model), [model]);

  return (
    <context.Provider value={state}>
      <SideBySideConnected {...rest} />
    </context.Provider>
  );
};

export const SideBySideConnected: React.FC<Omit<SideBySideSyncProps, 'model'>> = ({renderDisplay}) => {
  const state = useSideBySideSyncState();

  return (
    <Paper fill={2}>
      <TopBar />
      <Split>
        <div style={{width: '50%', padding: 16, boxSizing: 'border-box'}}>
          <JsonCrdtModel model={state.left.end} state={state.leftState} renderDisplay={renderDisplay} order={['display', 'model', 'view']} />
        </div>
        <div style={{width: '50%', padding: 16, boxSizing: 'border-box'}}>
          <JsonCrdtModel model={state.right.end} state={state.rightState} renderDisplay={renderDisplay} order={['display', 'model', 'view']} />
        </div>
      </Split>
    </Paper>
  );
};
