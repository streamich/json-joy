import {type Model, Timestamp} from 'json-joy/lib/json-crdt';
import * as React from 'react';
import type {JsonNode} from 'json-joy/lib/json-crdt/nodes/types';
import {NodeCard, type NodeCardProps} from './NodeCard';
import {StrNodeCard, type StrNodeCardProps} from './StrNodeCard';

export interface JsonCrdtModelClickableProps extends NodeCardProps {}

export const JsonCrdtNodePreview: React.FC<JsonCrdtModelClickableProps> = (props) => {
  if (props.node.name() === 'str') {
    return <StrNodeCard {...(props as StrNodeCardProps)} />;
  }

  return <NodeCard {...props} />;
};

const getNode = (model: Model<any>, nodeId: string): null | JsonNode => {
  if (nodeId === '0.0') return model.root;
  const [sid, time] = nodeId.split('.');
  const id = new Timestamp(Number(sid), Number(time));
  const node = nodeId ? (model.index.get(id) ?? null) : null;
  return node;
};

export interface JsonCrdtModelClickableByIdProps extends Omit<JsonCrdtModelClickableProps, 'node'> {
  model: Model<any>;
  id: string;
}

export const JsonCrdtNodePreviewById: React.FC<JsonCrdtModelClickableByIdProps> = ({model, id, ...rest}) => {
  const node = React.useMemo(() => getNode(model, id), [model, id]);

  if (!node) return null;

  return <JsonCrdtNodePreview {...rest} model={model} node={node} />;
};
