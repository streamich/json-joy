import {SyncStore} from '../../util/events/sync-store';
import {JsonNodeApi} from '../model/api/types';
import {JsonPatch} from './JsonPatch';
import type {Path} from '../../json-pointer/types';
import type {Model} from '../model';
import type {Operation} from '../../json-patch';
import type {JsonNode, JsonNodeView} from '../nodes';

export class JsonPatchStore<N extends JsonNode = JsonNode<any>> implements SyncStore<Readonly<JsonNodeView<N>>> {
  public readonly node: N;
  public readonly api: JsonNodeApi<N>;
  public readonly patcher: JsonPatch<N>;
  public readonly pfx: string;

  constructor(
    protected readonly model: Model<N>,
    public readonly path: Path = [],
  ) {
    this.pfx = path.length ? path.join() : '';
    const api = model.api;
    this.node = api.find(path) as N;
    this.api = api.wrap(this.node) as unknown as JsonNodeApi<N>;
    this.patcher = new JsonPatch(model, path);
  }

  public readonly update = (change: Operation | Operation[]): void => {
    const ops = Array.isArray(change) ? change : [change];
    this.patcher.apply(ops);
  };

  public bind(path: Path): JsonPatchStore<N> {
    return new JsonPatchStore(this.model, this.path.concat(path));
  }

  // ---------------------------------------------------------------- SyncStore

  public readonly subscribe = (callback: () => void) => this.api.events.onChanges.listen(() => callback());
  public readonly getSnapshot = () => this.node.view() as Readonly<JsonNodeView<N>>;
}
