import type {Model} from 'json-joy/lib/json-crdt';
import {Encoder} from 'json-joy/lib/json-crdt/codec/structural/verbose/Encoder';
import * as React from 'react';
import {JsonBlock} from '../../JsonBlock';
import {useModelTick} from '../../hooks/useModelTick';

export interface JsonCrdtModelVerboseProps {
  model: Model<any>;
}

export const JsonCrdtModelVerbose: React.FC<JsonCrdtModelVerboseProps> = ({model}) => {
  useModelTick(model);

  const encoder = React.useMemo(() => new Encoder(), []);
  const value = React.useMemo(() => {
    return encoder.encode(model);
  }, [encoder, model, model.tick]);

  return <JsonBlock value={value} />;
};
