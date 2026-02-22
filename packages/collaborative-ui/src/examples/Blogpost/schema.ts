import {type Model, s, type nodes} from 'json-joy/lib/json-crdt';
import type {SchemaToJsonNode} from 'json-joy/lib/json-crdt/schema/types';
import type {JsonNodeApi} from 'json-joy/lib/json-crdt/model/api/types';

export const BlogpostSchema = s.obj({
  title: s.str(''),
  content: s.str(''),
  tags: s.arr<nodes.con<string>>([]),
  public: s.con(false),
});

export type BlogpostRoot = SchemaToJsonNode<typeof BlogpostSchema>;
export type BlogpostModel = Model<BlogpostRoot>;
export type BlogpostApi = JsonNodeApi<BlogpostRoot>;
