import type {Patch} from 'json-joy/lib/json-crdt';
import {encode} from 'json-joy/lib/json-crdt-patch/codec/verbose/encode';
import * as React from 'react';
import {JsonBlock} from '../../JsonBlock';

export interface JsonCrdtPatchVerbosePatch {
  patch: Patch;
}

export const JsonCrdtPatchVerbose: React.FC<JsonCrdtPatchVerbosePatch> = ({patch}) => {
  const value = React.useMemo(() => {
    return encode(patch);
  }, [patch]);

  return <JsonBlock value={value} />;
};
