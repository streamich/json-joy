import * as React from 'react';
import {PropertyLayout} from '../PropertyLayout';
import type {JsonNode} from 'json-joy/lib/json-crdt';
import type {NodeRef} from './NodeRef';

export interface JsonCrdtPropertyProps {
  node: NodeRef<JsonNode>;
}

export const JsonCrdtProperty: React.FC<JsonCrdtPropertyProps> = ({node}) => {
  if (!node.parent || node.parent.node.name() !== 'obj') return null;

  return <PropertyLayout property={node.step} />;
};
