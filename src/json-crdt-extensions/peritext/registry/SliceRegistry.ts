import {PeritextMlElement} from '../block/types';
import {NodeBuilder} from '../../../json-crdt-patch';
import type {JsonMlElement} from 'very-small-parser/lib/html/json-ml/types';
import type {FromHtmlConverter, SliceTypeDefinition, ToHtmlConverter} from './types';
import {SliceBehavior} from '../slice/constants';

export class SliceRegistry {
  private map: Map<string | number, SliceTypeDefinition<any, any, any>> = new Map();
  private toHtmlMap: Map<string | number, ToHtmlConverter<any>> = new Map();
  private fromHtmlMap: Map<string, [def: SliceTypeDefinition<any, any, any>, converter: FromHtmlConverter][]> = new Map();

  public add<Type extends number | string, Schema extends NodeBuilder, Inline extends boolean = true>(def: SliceTypeDefinition<Type, Schema, Inline>): void {
    const {type, toHtml, fromHtml} = def;
    this.map.set(type, def);
    if (toHtml) this.toHtmlMap.set(type, toHtml);
    if (fromHtml) {
      const fromHtmlMap = this.fromHtmlMap;
      for (const htmlTag in fromHtml) {
        const converter = fromHtml[htmlTag];
        const converters = fromHtmlMap.get(htmlTag) ?? [];
        converters.push([def, converter]);
        fromHtmlMap.set(htmlTag, converters);
      }
    }
  }

  public toHtml(el: PeritextMlElement): ReturnType<ToHtmlConverter<any>> | undefined {
    const converter = this.toHtmlMap.get(el[0]);
    return converter ? converter(el) : undefined;
  }

  public fromHtml(el: JsonMlElement): PeritextMlElement | undefined {
    const tag = el[0] + '';
    const converters = this.fromHtmlMap.get(tag);
    if (converters) {
      for (const [def, converter] of converters) {
        const result = converter(el);
        if (result) {
          const attr = result[1] ?? (result[1] = {});
          attr.inline = def.inline ?? (def.type < 0);
          attr.behavior = !attr.inline ? SliceBehavior.Marker : (def.behavior ?? SliceBehavior.Many);
          return result;
        }
      }
    }
    return;
  }
}
