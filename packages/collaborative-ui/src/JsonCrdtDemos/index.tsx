import * as React from 'react';
import {JsonCrdtDemosState} from './JsonCrdtDemosState';
import {context} from './context';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import {useNiceUiServices} from 'nice-ui/lib/context';
import {Preview} from './Preview';
import {Landing} from './Landing';

export interface JsonCrdtDemosProps {
  state?: JsonCrdtDemosState;
  basePath?: string[];
}

export const JsonCrdtDemos: React.FC<JsonCrdtDemosProps> = ({state: _state, basePath = []}) => {
  const services = useNiceUiServices();
  // biome-ignore lint: manual dependency list
  const state = React.useMemo(
    () => _state || new JsonCrdtDemosState({basePath, nav: services.nav}),
    [_state, services],
  );
  const steps = useBehaviorSubject(state.steps$);

  let content: React.ReactNode;

  if (steps[0] === 'live' && typeof steps[1] === 'string') {
    content = <Preview id={steps[1]} />;
  } else {
    content = <Landing />;
  }

  return <context.Provider value={state}>{content}</context.Provider>;
};
