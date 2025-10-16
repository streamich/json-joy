import type {SyncStore} from '../../util/events/sync-store';
import type {JsonNodeApi} from '../model/api/types';
import {JsonPatch} from './JsonPatch';
import {toPath} from '@jsonjoy.com/json-pointer/lib/util';
import type {Path} from '@jsonjoy.com/json-pointer/lib/types';
import type {Model, NodeApi} from '../model';
import type {Operation, OperationAdd, OperationRemove, OperationReplace} from '../../json-patch';
import type {JsonNode, JsonNodeView} from '../nodes';

export class JsonPatchStore<N extends JsonNode = JsonNode<any>> implements SyncStore<Readonly<JsonNodeView<N>>> {
  public readonly patcher: JsonPatch<N>;
  public readonly pfx: string;

  constructor(
    public readonly model: Model<N>,
    public readonly path: Path = [],
    public readonly base?: NodeApi<any>,
  ) {
    this.pfx = path.length ? path.join() : '';
    const api = model.api;
    this.patcher = new JsonPatch(model, path, base);
    this.subscribe = (listener) => api.onChange.listen(listener);
  }

  public readonly update = (change: Operation | Operation[]): void => {
    const ops = Array.isArray(change) ? change : [change];
    this.patcher.apply(ops);
  };

  public readonly add = (path: string | Path, value: unknown): Operation => {
    const op: OperationAdd = {op: 'add', path, value};
    this.update([op]);
    return op;
  };

  public readonly replace = (path: string | Path, value: unknown): Operation => {
    const op: OperationReplace = {op: 'replace', path, value};
    this.update([op]);
    return op;
  };

  public readonly remove = (path: string | Path): Operation => {
    const op: OperationRemove = {op: 'remove', path};
    this.update([op]);
    return op;
  };

  public readonly del = (path: string | Path): Operation | undefined => {
    try {
      return this.remove(path);
    } catch {
      return;
    }
  };

  public readonly get = (path: string | Path = ''): unknown => this.patcher.get(path);

  public bind(path: string | Path): JsonPatchStore<N> {
    return new JsonPatchStore(this.model, this.path.concat(toPath(path)), this.base);
  }

  public api(): JsonNodeApi<N> | undefined {
    try {
      return this.model.api.find(this.path) as unknown as JsonNodeApi<N>;
    } catch {
      return;
    }
  }

  // ---------------------------------------------------------------- SyncStore

  public readonly subscribe: SyncStore<any>['subscribe'];
  public readonly getSnapshot = () => this.get() as Readonly<JsonNodeView<N>>;
}
