import {ViewRange} from './editor/types';
import {Range} from './rga/Range';
import {registry as defaultRegistry} from './registry/registry';
import type {SliceRegistry} from './registry/SliceRegistry';
import type {Peritext} from './Peritext';
import type {PeritextMlElement, PeritextMlNode} from './block/types';
import type {JsonMlNode} from 'very-small-parser/lib/html/json-ml/types';
import type {THtmlToken} from 'very-small-parser/lib/html/types';

export type PeritextDataTransferHtmlExportTools = typeof import('./lazy/export-html');
export type PeritextDataTransferHtmlImportTools = typeof import('./lazy/import-html');

export interface PeritextDataTransferOpts {
  registry?: SliceRegistry;
  htmlExport?: PeritextDataTransferHtmlExportTools;
  htmlImport?: PeritextDataTransferHtmlImportTools;
}

export class PeritextDataTransfer<T = string> {
  constructor (
    public readonly txt: Peritext<T>,
    public readonly opts: PeritextDataTransferOpts = {},
  ) {}

  // ------------------------------------------------------------------ exports

  public toView(range: Range<T>): ViewRange {
    return this.txt.editor.export(range);
  }

  public toJson(range: Range<T>): PeritextMlElement {
    const fragment = this.txt.fragment(range);
    fragment.refresh();
    return fragment.toJson();
  }

  protected htmlE(): PeritextDataTransferHtmlExportTools {
    const tools = this.opts.htmlExport;
    if (!tools) throw new Error('NO_HTML_EXPORT_TOOLS');
    return tools;
  }

  public toJsonMl(range: Range<T>): JsonMlNode {
    const tools = this.htmlE();
    const json = this.toJson(range);
    return tools.toJsonMl(json);
  }
  
  public toHast(range: Range<T>): THtmlToken {
    const tools = this.htmlE();
    const json = this.toJson(range);
    return tools.toHast(json);
  };
  
  public toHtml(range: Range<T>, tab?: string, indent?: string): string {
    const tools = this.htmlE();
    const json = this.toJson(range);
    return tools.toHtml(json, tab, indent);
  }

  // ------------------------------------------------------------------ imports

  public fromView(pos: number, view: ViewRange): void {
    this.txt.editor.import(pos, view);
  }

  public fromJson(pos: number, json: PeritextMlElement | PeritextMlNode): void {
    const tools = this.htmlI();
    const view = tools.toViewRange(json);
    this.fromView(pos, view);
  }

  protected htmlI(): PeritextDataTransferHtmlImportTools {
    const tools = this.opts.htmlImport;
    if (!tools) throw new Error('NO_HTML_IMPORT_TOOLS');
    return tools;
  }

  public fromJsonMl(pos: number, jsonml: JsonMlNode): void {
    const tools = this.htmlI();
    const registry = this.opts.registry ?? defaultRegistry;
    const json = tools.fromJsonMl(jsonml, registry);
    this.fromJson(pos, json);
  }
  
  public fromHast(pos: number, hast: THtmlToken): void {
    const tools = this.htmlI();
    const registry = this.opts.registry ?? defaultRegistry;
    const json = tools.fromHast(hast, registry);
    this.fromJson(pos, json);
  }
  
  public fromHtml(pos: number, html: string): void {
    const tools = this.htmlI();
    const registry = this.opts.registry ?? defaultRegistry;
    const json = tools.fromHtml(html, registry);
    this.fromJson(pos, json);
  }
}
