import * as React from 'react';
import type {JsonNode, Model} from 'json-joy/lib/json-crdt';
import {JsonCrdtNodePreview} from '../../JsonCrdtNodePreview';

export interface NodeItemProps {
  model: Model<any>;
  node: JsonNode;
  readonly?: boolean;
}

export const NodeItem: React.FC<NodeItemProps> = ({model, node, readonly}) => {
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <JsonCrdtNodePreview
      collapsed={collapsed}
      model={model}
      node={node}
      readonly={readonly}
      onTitleClick={() => setCollapsed((x) => !x)}
    />
  );
};
