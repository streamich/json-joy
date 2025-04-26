import {s} from '../../../../json-crdt-patch';
import {Model, ObjApi} from '../../../../json-crdt/model';
import type {Slice} from "../../../../json-crdt-extensions";
import type {Range} from "../../../../json-crdt-extensions/peritext/rga/Range";
import type {ToolbarSliceBehavior} from "../types";
import type {SliceBehavior} from '../../../../json-crdt-extensions/peritext/registry/SliceBehavior';
import type {ObjNode} from '../../../../json-crdt/nodes';
import type {ToolbarState} from '.';
import type {PersistedSlice} from '../../../../json-crdt-extensions/peritext/slice/PersistedSlice';

export interface FormattingBase<B extends SliceBehavior<any, any, any, any>, R extends Range<string>> {
  behavior: B;
  range: R;
}

export interface FormattingWithConfig<Node extends ObjNode = ObjNode> {
  conf(): ObjApi<Node> | undefined;
}

export interface ToolbarFormatting<R extends Range<string> = Range<string>, Node extends ObjNode = ObjNode> extends FormattingBase<ToolbarSliceBehavior, R>, FormattingWithConfig<Node> {}

export class RangeFormatting<R extends Range<string> = Range<string>, Node extends ObjNode = ObjNode> implements ToolbarFormatting<R, Node> {
  public constructor(
    public readonly behavior: ToolbarSliceBehavior,
    public readonly range: R,
  ) {}

  public conf(): ObjApi<Node> | undefined {
    return;
  }
}

/**
 * Formatting is a specific application of known formatting option to a range of
 * text. Formatting is composed of a specific {@link Slice} which stores the
 * state (location, data) of the formatting and a {@link ToolbarSliceBehavior}
 * which defines the formatting behavior.
 */
export class SavedFormatting<Node extends ObjNode = ObjNode> extends RangeFormatting<PersistedSlice<string>, Node> {
  public constructor(
    public readonly behavior: ToolbarSliceBehavior,
    public readonly range: PersistedSlice<string>,
  ) {
    super(behavior, range);
  }

  /**
   * @returns Unique key for this formatting. This is the hash of the slice.
   *     This is used to identify the formatting in the UI.
   */
  public key(): number {
    return this.range.hash;
  }

  public conf(): ObjApi<Node> | undefined {
    const node = this.range.dataNode();
    return node instanceof ObjApi ? node : undefined;
  }
}

/**
 * New formatting which is being created. Once created, it will be promoted to
 * a {@link SavedFormatting} instance.
 */
export class NewFormatting<Node extends ObjNode = ObjNode> extends RangeFormatting<Range<string>, Node> {
  public readonly model: Model<ObjNode<{conf: any}>>;

  constructor(
    public readonly behavior: ToolbarSliceBehavior,
    public readonly range: Range<string>,
    public readonly state: ToolbarState,
  ) {
    super(behavior, range);
    const schema = s.obj({conf: behavior.schema || s.con(void 0)});
    this.model = Model.create(schema);
  }

  public conf(): ObjApi<Node> | undefined {
    return this.model.api.obj(['conf']) as ObjApi<Node>;
  }

  public readonly save = () => {
    const state = this.state;
    state.newSlice.next(void 0);
    const view = this.model.view();
    const data = view.conf as Record<string, unknown>;
    if (!data || typeof data !== 'object') return;
    if (!data.title) delete data.title;
    const et = state.surface.events.et;
    et.format('tog', this.behavior.tag, 'many', data);
    et.cursor({move: [['focus', 'char', 0, true]]});
  };
}
