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
  noDisplayHdr?: JsonCrdtModelProps['noDisplayHdr'];
}

export const SideBySideSync: React.FC<SideBySideSyncProps> = ({model, ...rest}) => {
  const state = React.useMemo(() => new SideBySideSyncState(model), [model]);
  React.useEffect(() => {
    return () => {
      state.dispose();
    };
  }, [state]);

  return (
    <context.Provider value={state}>
      <SideBySideConnected {...rest} />
    </context.Provider>
  );
};

const order: JsonCrdtModelProps['order'] = ['display', 'view', 'model'];

export const SideBySideConnected: React.FC<Omit<SideBySideSyncProps, 'model'>> = (props) => {
  const state = useSideBySideSyncState();

  return (
    <Paper fill={2} round>
      <TopBar />
      <Split>
        <div style={{width: '50%', padding: 16, boxSizing: 'border-box'}}>
          <JsonCrdtModel
            {...props}
            model={state.left.end}
            presence={state.leftPresence}
            state={state.leftState}
            order={order}
          />
        </div>
        <div style={{width: '50%', padding: 16, boxSizing: 'border-box'}}>
          <JsonCrdtModel
            {...props}
            model={state.right.end}
            presence={state.rightPresence}
            state={state.rightState}
            order={order}
          />
        </div>
      </Split>
    </Paper>
  );
};
