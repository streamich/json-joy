import type {Model} from 'json-joy/lib/json-crdt';

export interface DemoProps {
  model: Model<any>;
  path?: string[];
  readonly?: boolean;
}
