import * as React from 'react';
import type {Model} from 'json-joy/lib/json-crdt';
import type {NodeRef} from './NodeRef';

export interface ClickableJsonCrdtContextValue {
  model: Model;
  render: (node: NodeRef<any>) => React.ReactNode;
}

export const context = React.createContext<ClickableJsonCrdtContextValue>(null!);

export const useJsonCrdt = () => React.useContext(context);
