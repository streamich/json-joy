import type {Model} from 'json-joy/lib/json-crdt';
import * as React from 'react';
import type {JsonNode} from 'json-joy/lib/json-crdt/nodes/types';
import {MiniTitle} from 'nice-ui/lib/3-list-item/MiniTitle';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {LogicalTimestamp} from '../LogicalTimestamp';
import {Code} from 'nice-ui/lib/1-inline/Code';
import {CardLayout} from '../CardLayout';
import {CopyText} from '../CopyText';

export interface NodeCardProps {
  model: Model<any>;
  node: JsonNode;
  collapsed?: boolean;
  readonly?: boolean;
  children?: React.ReactNode;
  right?: React.ReactNode;
  onClose?: React.MouseEventHandler;
  onTitleClick?: React.MouseEventHandler;
}

export const NodeCard: React.FC<NodeCardProps> = ({model, node, collapsed, children, right, onClose, onTitleClick}) => {
  const api = model.api.wrap(node);
  React.useSyncExternalStore(api.events.subscribe, () => model.tick);

  return (
    <CardLayout
      left={
        <>
          <MiniTitle>Node</MiniTitle>
          <Space horizontal size={-2} />
          <Code size={-1} gray nowrap noBg>
            {node.name()}
          </Code>
          &nbsp;
          <LogicalTimestamp sid={node.id.sid} time={node.id.time} />
        </>
      }
      right={right}
      onClose={onClose}
      onTitleClick={onTitleClick}
    >
      {collapsed
        ? null
        : (children ?? (
            <pre style={{margin: 0, padding: 0, fontSize: '11px'}}>
              <CopyText src={() => node + ''} />
            </pre>
          ))}
    </CardLayout>
  );
};
