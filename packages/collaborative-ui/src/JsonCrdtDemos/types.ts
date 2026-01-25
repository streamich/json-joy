import type {Model, NodeBuilder} from 'json-joy/lib/json-crdt';

export interface DemoDefinition {
  id: string;
  type?: 'text';
  title: string;
  schema: NodeBuilder;
  frame?: 'fitted' | 'spacious';
  render: (props: {model: Model<any>; readonly?: boolean}) => React.ReactNode;
}
