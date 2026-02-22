import type {Patch} from 'json-joy/lib/json-crdt';
import * as React from 'react';
import {BinaryBlock} from '../../BinaryBlock';

const LIMIT = 1024 * 4;

export interface JsonCrdtPatchBinaryProps {
  patch: Patch;
}

export const JsonCrdtPatchBinary: React.FC<JsonCrdtPatchBinaryProps> = ({patch}) => {
  const uint8 = React.useMemo(() => {
    const data = patch.toBinary();
    if (data.byteLength > LIMIT) return data.slice(0, LIMIT);
    return data;
  }, [patch]);

  return <BinaryBlock uint8={uint8} />;
};
