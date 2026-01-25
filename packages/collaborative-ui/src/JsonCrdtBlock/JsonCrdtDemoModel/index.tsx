import * as React from 'react';
import type {Model} from 'json-joy/lib/json-crdt';
import {JsonCrdtModel} from '../../JsonCrdtModel';

export interface JsonCrdtDemoModelProps {
  model: Model;
}

export const JsonCrdtDemoModel: React.FC<JsonCrdtDemoModelProps> = ({model}) => {
  return <JsonCrdtModel model={model} />;
};
