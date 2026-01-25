import type {Model} from 'json-joy/lib/json-crdt';
import {Encoder} from 'json-joy/lib/json-crdt/codec/indexed/binary/Encoder';
import * as React from 'react';
import {JsonBlock} from '../../JsonBlock';
import {useModelTick} from '../../hooks/useModelTick';

export interface JsonCrdtModelIndexedProps {
  model: Model<any>;
}

export const JsonCrdtModelIndexed: React.FC<JsonCrdtModelIndexedProps> = ({model}) => {
  const tick = useModelTick(model);

  const encoder = React.useMemo(() => new Encoder(), []);
  // biome-ignore lint: manually managed dependency list
  const value = React.useMemo(() => {
    return encoder.encode(model);
  }, [encoder, model, tick]);

  return <JsonBlock value={value} />;
};
