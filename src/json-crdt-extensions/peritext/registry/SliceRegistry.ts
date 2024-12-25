import {PeritextMlElement} from '../block/types';
import type {JsonMlNode} from 'very-small-parser/lib/html/json-ml/types';
import type {FromHtmlConverter, SliceTypeDefinition, ToHtmlConverter} from './types';

export class SliceRegistry {
  private map: Map<string | number, SliceTypeDefinition> = new Map();
  private toHtmlMap: Map<string | number, ToHtmlConverter> = new Map();
  private fromHtmlMap: Map<string, FromHtmlConverter[]> = new Map();

  public add(def: SliceTypeDefinition<PeritextMlElement<any, any, any>>): this {
    const {type, toHtml, fromHtml} = def;
    this.map.set(type, def);
    if (toHtml) this.toHtmlMap.set(type, toHtml);
    if (fromHtml)
      for (const htmlTag in fromHtml) {
        const converter = fromHtml[htmlTag];
        const converters = this.fromHtmlMap.get(htmlTag) ?? [];
        converters.push(converter);
        this.fromHtmlMap.set(htmlTag, converters);
      }
    return this;
  }

  public toHtml(el: PeritextMlElement): JsonMlNode | undefined {
    const converter = this.toHtmlMap.get(el[0]);
    return converter ? converter(el) : undefined;
  }

  public fromHtml(el: JsonMlNode): PeritextMlElement | undefined {
    const tag = el[0] + '';
    const converters = this.fromHtmlMap.get(tag);
    for (const converter of converters ?? []) {
      const result = converter(el);
      if (result) return result;
    }
    return;
  }
}
