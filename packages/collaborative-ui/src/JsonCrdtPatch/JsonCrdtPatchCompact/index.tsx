import type {Patch} from 'json-joy/lib/json-crdt';
import {encode} from 'json-joy/lib/json-crdt-patch/codec/compact/encode';
import * as React from 'react';
import {JsonBlock} from '../../JsonBlock';

export interface JsonCrdtPatchCompactPatch {
  patch: Patch;
}

export const JsonCrdtPatchCompact: React.FC<JsonCrdtPatchCompactPatch> = ({patch}) => {
  const value = React.useMemo(() => {
    return encode(patch);
  }, [patch]);

  return <JsonBlock value={value} />;
};
