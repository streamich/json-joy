import {ViewRange} from './editor/types';
import {Range} from './rga/Range';
import type {Peritext} from './Peritext';
import type {PeritextMlElement} from './block/types';
import type {JsonMlNode} from '../../json-ml';
import type {THtmlToken} from 'very-small-parser/lib/html/types';

export type PeritextDataTransferHtmlTools = typeof import('./lazy/export-html');

export interface PeritextDataTransferOpts {
  html?: PeritextDataTransferHtmlTools;
}

export class PeritextDataTransfer<T = string> {
  constructor (
    public readonly txt: Peritext<T>,
    public readonly opts: PeritextDataTransferOpts = {},
  ) {}

  public toView(range: Range<T>): ViewRange {
    return this.txt.editor.export(range);
  }

  public toJson(range: Range<T>): PeritextMlElement {
    const fragment = this.txt.fragment(range);
    fragment.refresh();
    return fragment.toJson();
  }

  protected _html(): PeritextDataTransferHtmlTools {
    const tools = this.opts.html;
    if (!tools) throw new Error('NO_HTML_TOOLS');
    return tools;
  }

  public toJsonMl(range: Range<T>): JsonMlNode {
    const tools = this._html();
    const json = this.toJson(range);
    return tools.toJsonMl(json);
  }
  
  public toHast(range: Range<T>): THtmlToken {
    const tools = this._html();
    const json = this.toJson(range);
    return tools.toHast(json);
  };
  
  public toHtml(range: Range<T>, tab?: string, indent?: string): string {
    const tools = this._html();
    const json = this.toJson(range);
    return tools.toHtml(json, tab, indent);
  }
}
