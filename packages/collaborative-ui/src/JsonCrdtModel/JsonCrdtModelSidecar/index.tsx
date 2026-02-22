import type {Model} from 'json-joy/lib/json-crdt';
import * as React from 'react';
import {BinaryBlock} from '../../BinaryBlock';
import {Encoder} from 'json-joy/lib/json-crdt/codec/sidecar/binary/Encoder';
import {useModelTick} from '../../hooks/useModelTick';

const LIMIT = 1024 * 4;

export interface JsonCrdtModelSidecarProps {
  model: Model<any>;
}

export const JsonCrdtModelSidecar: React.FC<JsonCrdtModelSidecarProps> = ({model}) => {
  useModelTick(model);

  const uint8 = React.useMemo(() => {
    const encoder = new Encoder();
    const [, data] = encoder.encode(model);
    if (data.byteLength > LIMIT) return data.slice(0, LIMIT);
    return data;
  }, [model, model.tick]);

  return <BinaryBlock uint8={uint8} />;
};
