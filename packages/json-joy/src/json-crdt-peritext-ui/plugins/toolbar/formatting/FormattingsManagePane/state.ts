import {BehaviorSubject} from 'rxjs';
import {SavedFormatting} from '../../state/formattings';
import {PersistedSlice} from '../../../../../json-crdt-extensions/peritext/slice/PersistedSlice';
import {subject} from '../../../../util/rx';
import {toSchema} from '../../../../../json-crdt/schema/toSchema';
import {JsonCrdtDiff} from '../../../../../json-crdt-diff/JsonCrdtDiff';
import {Model, type ObjApi} from '../../../../../json-crdt/model';
import type {ObjNode} from '../../../../../json-crdt/nodes';
import type {Inline} from '../../../../../json-crdt-extensions';
import type {ToolbarState} from '../../state';

export class FormattingManageState {
  public readonly selected$ = new BehaviorSubject<SavedFormatting | null>(null);
  public readonly view$ = new BehaviorSubject<'view' | 'edit'>('view');
  public readonly editing$ = new BehaviorSubject<SavedShadowFormatting | undefined>(undefined);

  public constructor(
    public readonly state: ToolbarState,
    public readonly inline: Inline | undefined,
  ) {}

  public getFormattings$(inline: Inline | undefined = this.inline): BehaviorSubject<SavedFormatting[]> {
    const state = this.state;
    return subject(state.surface.render$, () => {
      const slices = inline?.p1.layers;
      const res: SavedFormatting[] = [];
      if (!slices) return res;
      const registry = state.txt.editor.getRegistry();
      for (const slice of slices) {
        const tag = slice.type();
        if (typeof tag !== 'number' && typeof tag !== 'string') continue;
        const behavior = registry.get(tag);
        if (!behavior) continue;
        const isConfigurable = !!behavior.schema;
        if (!isConfigurable) continue;
        if (!(slice instanceof PersistedSlice)) continue;
        res.push(new SavedFormatting(behavior, slice, state));
      }
      return res;
    });
  }

  public readonly select = (formatting: SavedFormatting | null) => {
    this.selected$.next(formatting);
  };

  public readonly switchToViewPanel = (): void => {
    this.view$.next('view');
    this.editing$.next(void 0);
  };

  public readonly switchToEditPanel = (): void => {
    const selected = this.selected$.getValue();
    if (!selected) return;
    this.view$.next('edit');
    const formatting = new SavedShadowFormatting(selected);
    this.editing$.next(formatting);
  };

  public readonly returnFromEditPanelAndSave = (): void => {
    const shadowFormatting = this.editing$.getValue();
    if (!shadowFormatting) return;
    const view = shadowFormatting.conf()!.view();
    const formatting = shadowFormatting.saved;
    const data = formatting.conf();
    if (!data) return;
    const model = data.api.model;
    const patch = new JsonCrdtDiff(model).diff(data.node, view);
    if (patch.ops.length) model.applyPatch(patch);
    this.switchToViewPanel();
    this.state.surface.rerender();
  };
}

export class SavedShadowFormatting<Node extends ObjNode = ObjNode> extends SavedFormatting<Node> {
  protected _model: Model<any>;

  constructor(public readonly saved: SavedFormatting<Node>) {
    super(saved.behavior, saved.range, saved.state);
    const nodeApi = saved.conf();
    const schema = nodeApi ? toSchema(nodeApi.node) : void 0;
    this._model = Model.create(schema);
  }

  public conf(): ObjApi<Node> | undefined {
    return this._model.api.obj([]) as ObjApi<Node>;
  }
}
