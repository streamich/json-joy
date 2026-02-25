import {s} from 'json-joy/lib/json-crdt-patch';
import {Model, ObjApi} from 'json-joy/lib/json-crdt/model';
import type {Slice} from 'json-joy/lib/json-crdt-extensions';
import type {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';
import type {ToolbarSliceBehavior, ValidationResult} from '../types';
import type {SliceBehavior} from 'json-joy/lib/json-crdt-extensions/peritext/registry/SliceBehavior';
import type {ObjNode} from 'json-joy/lib/json-crdt/nodes';
import type {ToolbarState} from '.';

export interface FormattingBase<B extends SliceBehavior<any, any, any, any>, R extends Range<string>> {
  behavior: B;
  range: R;
}

export interface FormattingWithConfig<Node extends ObjNode = ObjNode> {
  conf(): ObjApi<Node> | undefined;
}

export interface ToolbarFormatting<R extends Range<string> = Range<string>, Node extends ObjNode = ObjNode>
  extends FormattingBase<ToolbarSliceBehavior, R>,
    FormattingWithConfig<Node> {}

export abstract class EditableFormatting<R extends Range<string> = Range<string>, Node extends ObjNode = ObjNode>
  implements ToolbarFormatting<R, Node>
{
  public constructor(
    public readonly behavior: ToolbarSliceBehavior,
    public readonly range: R,
    public readonly state: ToolbarState,
  ) {}

  public conf(): ObjApi<Node> | undefined {
    return;
  }

  public validate(): ValidationResult {
    return this.behavior.data()?.validate?.(this) ?? 'fine';
  }
}

/**
 * Formatting is a specific application of known formatting option to a range of
 * text. Formatting is composed of a specific {@link Slice} which stores the
 * state (location, data) of the formatting and a {@link ToolbarSliceBehavior}
 * which defines the formatting behavior.
 */
export class SavedFormatting<Node extends ObjNode = ObjNode> extends EditableFormatting<Slice<string>, Node> {
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
export class NewFormatting<Node extends ObjNode = ObjNode> extends EditableFormatting<Range<string>, Node> {
  public readonly model: Model<ObjNode<{conf: any}>>;

  constructor(
    public readonly behavior: ToolbarSliceBehavior,
    public readonly range: Range<string>,
    public readonly state: ToolbarState,
  ) {
    super(behavior, range, state);
    const schema = s.obj({conf: behavior.schema || s.con(void 0)});
    this.model = Model.create(schema);
  }

  public conf(): ObjApi<Node> | undefined {
    return this.model.api.obj(['conf']) as ObjApi<Node>;
  }

  public readonly save = () => {
    const state = this.state;
    state.newSlice.next(void 0);
    const view = this.conf()?.view() as Record<string, unknown>;
    if (!view || typeof view !== 'object') return;
    if (!view.title) delete view.title;
    const et = state.surface.events.et;
    et.format('tog', this.behavior.tag, 'many', view);
    et.cursor({move: [['focus', 'char', 0, true]]});
  };
}
