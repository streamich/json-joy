import type {PeritextMlElement} from '../block/types';
import type {JsonMlNode} from 'very-small-parser/lib/html/json-ml/types';

export interface SliceTypeDefinition<El extends PeritextMlElement<any, any, any> = PeritextMlElement> {
  type: El[0];
  toHtml?: ToHtmlConverter<El>;
  fromHtml?: {
    [htmlTag: string]: FromHtmlConverter<El>;
  };
}

export type ToHtmlConverter<El extends PeritextMlElement<any, any, any> = PeritextMlElement> =
  (element: El) => JsonMlNode;

export type FromHtmlConverter<El extends PeritextMlElement<any, any, any> = PeritextMlElement> =
  (jsonml: JsonMlNode) => El | undefined;
