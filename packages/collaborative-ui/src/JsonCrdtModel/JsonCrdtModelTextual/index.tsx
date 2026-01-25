import * as React from 'react';
import type {Model} from 'json-joy/lib/json-crdt';
import {TextBlock} from '../../TextBlock';
import {useModelTick} from '../../hooks/useModelTick';

export interface JsonCrdtModelTextualProps {
  model: Model<any>;
}

export const JsonCrdtModelTextual: React.FC<JsonCrdtModelTextualProps> = ({model}) => {
  useModelTick(model);

  return <TextBlock compact src={model.toString()} />;
};
