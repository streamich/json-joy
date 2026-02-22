import type {Model} from 'json-joy/lib/json-crdt';
import {Encoder} from 'json-joy/lib/json-crdt/codec/structural/compact/Encoder';
import * as React from 'react';
import {JsonBlock} from '../../JsonBlock';
import {useModelTick} from '../../hooks/useModelTick';

export interface JsonCrdtModelCompactProps {
  model: Model<any>;
}

export const JsonCrdtModelCompact: React.FC<JsonCrdtModelCompactProps> = ({model}) => {
  useModelTick(model);

  const encoder = React.useMemo(() => new Encoder(), []);
  const value = React.useMemo(() => {
    return encoder.encode(model);
  }, [encoder, model, model.tick]);

  return <JsonBlock value={value} />;
};
