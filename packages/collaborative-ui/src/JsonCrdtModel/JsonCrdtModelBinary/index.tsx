import type {Model} from 'json-joy/lib/json-crdt';
import * as React from 'react';
import {BinaryBlock} from '../../BinaryBlock';
import {useModelTick} from '../../hooks/useModelTick';

const LIMIT = 1024 * 4;

export interface JsonCrdtModelBinaryProps {
  model: Model<any>;
}

export const JsonCrdtModelBinary: React.FC<JsonCrdtModelBinaryProps> = ({model}) => {
  useModelTick(model);

  // biome-ignore lint: manual dependency list
  const uint8 = React.useMemo(() => {
    const data = model.toBinary();
    if (data.byteLength > LIMIT) return data.slice(0, LIMIT);
    return data;
  }, [model, model.tick]);

  return <BinaryBlock uint8={uint8} />;
};
