import {SliceBehavior, type SliceTypeCon} from '../slice/constants';
import {CommonSliceType} from '../slice';
import {SliceRegistryEntry} from './SliceRegistryEntry';
import {printTree} from 'tree-dump/lib/printTree';
import type {PeritextMlElement} from '../block/types';
import type {JsonMlElement} from 'very-small-parser/lib/html/json-ml/types';
import type {FromHtmlConverter, ToHtmlConverter} from './types';
import type {Printable} from 'tree-dump';

export type TypeTag = SliceTypeCon | number | string;

/**
 * Slice registry contains a record of possible inline an block formatting
 * annotations. Each entry in the registry is a {@link SliceRegistryEntry} that
 * specifies the behavior, tag, and other properties of the slice.
 *
 * @todo Consider moving the registry under the `/transfer` directory. Or maybe
 * `/slices` directory.
 */
export class SliceRegistry implements Printable {
  private map: Map<TypeTag, SliceRegistryEntry> = new Map();
  private _fromHtml: Map<string, [entry: SliceRegistryEntry, converter: FromHtmlConverter][]> = new Map();

  public clear(): void {
    this.map.clear();
    this._fromHtml.clear();
  }

  public add(entry: SliceRegistryEntry<any, any, any>): void {
    const {tag, fromHtml} = entry;
    this.map.set(tag, entry);
    const _fromHtml = this._fromHtml;
    if (fromHtml) {
      for (const htmlTag in fromHtml) {
        const converter = fromHtml[htmlTag];
        const converters = _fromHtml.get(htmlTag) ?? [];
        converters.push([entry, converter]);
        _fromHtml.set(htmlTag, converters);
      }
    }
    const tagStr = CommonSliceType[tag as SliceTypeCon];
    if (tagStr && typeof tagStr === 'string') _fromHtml.set(tagStr, [[entry, () => [tag, null]]]);
  }

  public get(tag: TypeTag): SliceRegistryEntry | undefined {
    return this.map.get(tag);
  }

  public isContainer(tag: TypeTag): boolean {
    const entry = this.map.get(tag);
    return entry?.container ?? false;
  }

  public toHtml(el: PeritextMlElement): ReturnType<ToHtmlConverter<any>> | undefined {
    const entry = this.map.get(el[0]);
    return entry?.toHtml ? entry?.toHtml(el) : void 0;
  }

  public fromHtml(el: JsonMlElement): PeritextMlElement | undefined {
    const tag = el[0] + '';
    const converters = this._fromHtml.get(tag);
    if (converters) {
      for (const [entry, converter] of converters) {
        const result = converter(el);
        if (result) {
          if (entry.isInline()) {
            const attr = result[1] ?? (result[1] = {});
            attr.inline = entry.isInline();
            attr.behavior = !attr.inline ? SliceBehavior.Marker : (entry.behavior ?? SliceBehavior.Many);
          }
          return result;
        }
      }
    }
    return;
  }

  /** ----------------------------------------------------- {@link Printable} */

  public toString(tab: string = ''): string {
    return `SliceRegistry` + printTree(tab, [...this.map.values()].map((entry) => tab => entry.toString(tab)));
  }
}
