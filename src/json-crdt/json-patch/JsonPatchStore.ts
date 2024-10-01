import {SyncStore} from '../../util/events/sync-store';
import {JsonNodeApi} from '../model/api/types';
import {JsonPatch} from './JsonPatch';
import {toPath} from '../../json-pointer/util';
import type {Path} from '../../json-pointer/types';
import type {Model} from '../model';
import type {Operation} from '../../json-patch';
import type {JsonNode, JsonNodeView} from '../nodes';

export class JsonPatchStore<N extends JsonNode = JsonNode<any>> implements SyncStore<Readonly<JsonNodeView<N>>> {
  public readonly patcher: JsonPatch<N>;
  public readonly pfx: string;

  constructor(
    public readonly model: Model<N>,
    public readonly path: Path = [],
  ) {
    this.pfx = path.length ? path.join() : '';
    const api = model.api;
    this.patcher = new JsonPatch(model, path);
    this.subscribe = (listener) => api.onChange.listen(listener);
  }

  public readonly update = (change: Operation | Operation[]): void => {
    const ops = Array.isArray(change) ? change : [change];
    this.patcher.apply(ops);
  };

  public readonly get = (path: string | Path = ''): unknown => {
    return this.patcher.get(path);
  };

  public bind(path: string | Path): JsonPatchStore<N> {
    return new JsonPatchStore(this.model, this.path.concat(toPath(path)));
  }

  public api(): JsonNodeApi<N> | undefined {
    try {
      return this.model.api.find(this.path) as unknown as JsonNodeApi<N>;
    } catch { return; }
  }

  // ---------------------------------------------------------------- SyncStore

  public readonly subscribe: SyncStore<any>['subscribe'];
  public readonly getSnapshot = () => this.api()?.view() as Readonly<JsonNodeView<N>>;
}
