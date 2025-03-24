import type {PeritextMlElement} from '../block/types';
import type {JsonMlElement} from 'very-small-parser/lib/html/json-ml/types';

export type ToHtmlConverter<
  El extends PeritextMlElement<any, any, any> = PeritextMlElement<string | number, unknown, boolean>,
> = (element: El) => [tag: string, attr: Record<string, string> | null];

export type FromHtmlConverter<
  El extends PeritextMlElement<any, any, any> = PeritextMlElement<string | number, unknown, boolean>,
> = (jsonml: JsonMlElement) => El;
