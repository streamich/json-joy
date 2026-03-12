import {Peritext} from './Peritext';
import {printTree} from 'tree-dump/lib/printTree';
import {ExtensionApi} from '../../json-crdt/extensions/ExtensionApi';
import {PeritextHeadless, PeritextHeadlessOpts} from './PeritextHeadless';
import type {PeritextNode} from './PeritextNode';
import type {StrApi, ArrApi, ArrNode, ModelApi} from '../../json-crdt';
import type {SliceNode} from './slice/types';

export class PeritextApi extends ExtensionApi<PeritextNode> {
  private _txt?: Peritext;

  /**
   * Returns the default shared {@link Peritext} instance.
   *
   * @deprecated Use {@link PeritextApi#peritext} instead.
   */
  public get txt(): Peritext {
    if (!this._txt) this._txt = this.peritext();
    return this._txt;
  }

  constructor(
    public node: PeritextNode,
    public readonly api: ModelApi<any>,
  ) {
    super(node, api);
  }

  public peritext(): Peritext {
    return new Peritext(this.api.model, this.node.text(), this.node.slices());
  }

  public headless(opts?: PeritextHeadlessOpts): PeritextHeadless {
    const txt = this.peritext();
    const headless = new PeritextHeadless(txt, opts);
    return headless;
  }

  public text(): StrApi {
    return this.api.wrap(this.node.text());
  }

  public slices(): ArrApi<ArrNode<SliceNode>> {
    return this.api.wrap(this.node.slices());
  }

  public toString(tab?: string): string {
    return (
      'PeritextApi' + printTree(tab, [(tab) => this.node.toString(tab), () => '', (tab) => this.txt.toString(tab)])
    );
  }
}
