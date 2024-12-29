import type {NodeBuilder} from '../../../json-crdt-patch';
import type {JsonNodeView} from '../../../json-crdt/nodes';
import {SchemaToJsonNode} from '../../../json-crdt/schema/types';
import type {PeritextMlElement} from '../block/types';
import type {JsonMlNode} from 'very-small-parser/lib/html/json-ml/types';

export interface SliceTypeDefinition<Type extends number | string, Schema extends NodeBuilder> {
  type: Type;
  schema: Schema;
  toHtml?: ToHtmlConverter<PeritextMlElement<Type, JsonNodeView<SchemaToJsonNode<Schema>>, true>>;
  fromHtml?: {
    [htmlTag: string]: FromHtmlConverter<PeritextMlElement<Type, JsonNodeView<SchemaToJsonNode<Schema>>, true>>;
  };
}

export type ToHtmlConverter<El extends PeritextMlElement<any, any, any>> =
  (element: El) => JsonMlNode;

export type FromHtmlConverter<El extends PeritextMlElement<any, any, any>> =
  (jsonml: JsonMlNode) => El | undefined;
