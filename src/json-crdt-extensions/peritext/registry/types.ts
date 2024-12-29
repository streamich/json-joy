import type {NodeBuilder} from '../../../json-crdt-patch';
import type {JsonNodeView} from '../../../json-crdt/nodes';
import type {SchemaToJsonNode} from '../../../json-crdt/schema/types';
import type {PeritextMlElement} from '../block/types';
import type {JsonMlElement} from 'very-small-parser/lib/html/json-ml/types';

export interface SliceTypeDefinition<Type extends number | string = number | string, Schema extends NodeBuilder = NodeBuilder, Inline extends boolean = true> {
  type: Type;
  schema: Schema;
  toHtml?: ToHtmlConverter<PeritextMlElement<Type, JsonNodeView<SchemaToJsonNode<Schema>>, Inline>>;
  fromHtml?: {
    [htmlTag: string]: FromHtmlConverter<PeritextMlElement<Type, JsonNodeView<SchemaToJsonNode<Schema>>, Inline>>;
  };
}

export type ToHtmlConverter<El extends PeritextMlElement<any, any, any> = PeritextMlElement<string | number, unknown, boolean>> =
  (element: El) => [tag: string, attr: Record<string, string> | null];

export type FromHtmlConverter<El extends PeritextMlElement<any, any, any> = PeritextMlElement<string | number, unknown, boolean>> =
  (jsonml: JsonMlElement) => El;
