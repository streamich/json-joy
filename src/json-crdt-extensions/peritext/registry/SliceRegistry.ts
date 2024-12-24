import type {FromHtmlConverter, SliceTypeDefinition, ToHtmlConverter} from './types';

export class SliceRegistry {
  private map: Map<string | number, SliceTypeDefinition> = new Map();
  private toHtmlMap: Map<string | number, ToHtmlConverter> = new Map();
  private fromHtmlMap: Map<string, FromHtmlConverter[]> = new Map();

  public add(def: SliceTypeDefinition): this {
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

  public toHtml(type: string | number, json: unknown): unknown {}
}
