import * as React from 'react';
import {Paper} from '@jsonjoy.com/ui/lib/4-card/Paper';
import {Split} from '@jsonjoy.com/ui/lib/3-list-item/Split';
import {context, useSideBySideSyncState} from './context';
import {SideBySideSyncState} from './SideBySideSyncState';
import {JsonCrdtModel, type JsonCrdtModelProps} from '../JsonCrdtModel';
import {TopBar} from './TopBar';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import type {Model} from 'json-joy/lib/json-crdt';

export interface SideBySideSyncProps {
  model: Model<any>;
  renderDisplay?: JsonCrdtModelProps['renderDisplay'];
  noDisplayHdr?: JsonCrdtModelProps['noDisplayHdr'];
  /** Panel order applied to both sides. Default: `['display', 'view', 'model']`. */
  order?: JsonCrdtModelProps['order'];
  /** Whether the interactive model view displays the root node wrapper. Default: true. */
  showRoot?: JsonCrdtModelProps['showRoot'];
  /** Initial open state per panel, applied to both sides. Overrides the defaults. */
  panels?: {model?: boolean; view?: boolean; display?: boolean};
}

export const SideBySideSync: React.FC<SideBySideSyncProps> = ({model, panels, ...rest}) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: panels is an initial-only override
  const state = React.useMemo(() => {
    const s = new SideBySideSyncState(model);
    if (panels) {
      for (const side of [s.leftState, s.rightState]) {
        if (panels.model !== undefined) side.showModel$.next(panels.model);
        if (panels.view !== undefined) side.showView$.next(panels.view);
        if (panels.display !== undefined) side.showDisplay$.next(panels.display);
      }
    }
    return s;
  }, [model]);
  React.useEffect(() => {
    state.start();
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

const defaultOrder: JsonCrdtModelProps['order'] = ['display', 'view', 'model'];

export const SideBySideConnected: React.FC<Omit<SideBySideSyncProps, 'model' | 'panels'>> = ({
  order = defaultOrder,
  ...props
}) => {
  const state = useSideBySideSyncState();
  const styles = useStyles();

  return (
    <Paper fill={2} round style={{background: styles.gN(0.99)}}>
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
