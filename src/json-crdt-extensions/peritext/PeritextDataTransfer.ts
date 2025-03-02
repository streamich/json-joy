import {registry as defaultRegistry} from './registry/registry';
import {toBase64} from '@jsonjoy.com/base64/lib/toBase64';
import type {Range} from './rga/Range';
import type {ViewRange} from './editor/types';
import type {SliceRegistry} from './registry/SliceRegistry';
import type {Peritext} from './Peritext';
import type {PeritextMlElement, PeritextMlNode} from './block/types';
import type {JsonMlNode} from 'very-small-parser/lib/html/json-ml/types';
import type {THtmlToken} from 'very-small-parser/lib/html/types';
import type {IRoot} from 'very-small-parser/lib/markdown/block/types';
import type {Fragment} from './block/Fragment';

const base64Str = (str: string) => toBase64(new TextEncoder().encode(str));

/** JSON data embedded as Base64 data attribute into HTML clipboard buffer. */
export interface ClipboardData {
  view: ViewRange;
}

export type PeritextDataTransferHtmlExportTools = typeof import('./lazy/export-html');
export type PeritextDataTransferHtmlImportTools = typeof import('./lazy/import-html');
export type PeritextDataTransferMarkdownExportTools = typeof import('./lazy/export-markdown');
export type PeritextDataTransferMarkdownImportTools = typeof import('./lazy/import-markdown');

export interface PeritextDataTransferOpts {
  registry?: SliceRegistry;
  htmlExport?: PeritextDataTransferHtmlExportTools;
  htmlImport?: PeritextDataTransferHtmlImportTools;
  mdExport?: PeritextDataTransferMarkdownExportTools;
  mdImport?: PeritextDataTransferMarkdownImportTools;
}

export class PeritextDataTransfer<T = string> {
  constructor(
    public readonly txt: Peritext<T>,
    public readonly opts: PeritextDataTransferOpts = {},
  ) {}

  // ------------------------------------------------------------------ exports

  public toView(range: Range<T>): ViewRange {
    return this.txt.editor.export(range);
  }

  public toFragment(range: Range<T>): Fragment<T> {
    const fragment = this.txt.fragment(range);
    fragment.refresh();
    return fragment;
  }

  public toJson(range: Range<T>): PeritextMlElement {
    const fragment = this.toFragment(range);
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
  }

  public toHtml(range: Range<T>, tab?: string, indent?: string): string {
    const tools = this.htmlE();
    const json = this.toJson(range);
    return tools.toHtml(json, tab, indent);
  }

  protected mdE(): PeritextDataTransferMarkdownExportTools {
    const tools = this.opts.mdExport;
    if (!tools) throw new Error('NO_MD_EXPORT_TOOLS');
    return tools;
  }

  public toMdast(range: Range<T>): IRoot {
    const tools = this.mdE();
    const json = this.toJson(range);
    return tools.toMdast(json);
  }

  public toMarkdown(range: Range<T>): string {
    const tools = this.mdE();
    const json = this.toJson(range);
    return tools.toMarkdown(json);
  }

  public toClipboard(range: Range<T>): {'text/plain': string; 'text/html': string} {
    const view = this.txt.editor.export(range);
    const data: ClipboardData = {view};
    const json = JSON.stringify(data);
    const jsonBase64 = base64Str(json);
    const html = this.toHtml(range) + '<b data-json-joy-peritext="' + jsonBase64 + '"/>';
    return {
      'text/plain': range.text(),
      'text/html': html,
    };
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

  private _imp<D>(pos: number, data: D, transform: (data: D, registry: SliceRegistry) => PeritextMlNode): void {
    const registry = this.opts.registry ?? defaultRegistry;
    const json = transform(data, registry);
    this.fromJson(pos, json);
  }

  protected htmlI(): PeritextDataTransferHtmlImportTools {
    const tools = this.opts.htmlImport;
    if (!tools) throw new Error('NO_HTML_IMPORT_TOOLS');
    return tools;
  }

  public fromJsonMl(pos: number, jsonml: JsonMlNode): void {
    this._imp(pos, jsonml, this.htmlI().fromJsonMl);
  }

  public fromHast(pos: number, hast: THtmlToken): void {
    this._imp(pos, hast, this.htmlI().fromHast);
  }

  public fromHtml(pos: number, html: string): void {
    this._imp(pos, html, this.htmlI().fromHtml);
  }

  protected mdI(): PeritextDataTransferMarkdownImportTools {
    const tools = this.opts.mdImport;
    if (!tools) throw new Error('NO_MD_IMPORT_TOOLS');
    return tools;
  }

  public fromMdast(pos: number, mdast: IRoot): void {
    this._imp(pos, mdast, this.mdI().fromMdast);
  }

  public fromMarkdown(pos: number, markdown: string): void {
    this._imp(pos, markdown, this.mdI().fromMarkdown);
  }

  public textFromHtml(html: string): string {
    return this.htmlI().textFromHtml(html);
  }
}
