import type {StrApi} from 'json-joy/lib/json-crdt';
import type {JsonPatchStore} from 'json-joy/lib/json-crdt/json-patch/JsonPatchStore';
import type {ReplicatedStrFacade} from './types';

/** "strict" store does not expose JSON CRDT model directly. */
export type JsonPatchStoreStrict = Pick<JsonPatchStore<any>, 'getSnapshot' | 'subscribe' | 'update'>;

export class StoreStrFacade implements ReplicatedStrFacade {
  public readonly view: ReplicatedStrFacade['view'];
  public readonly ins: ReplicatedStrFacade['ins'];
  public readonly del: ReplicatedStrFacade['del'];
  public readonly subscribe: ReplicatedStrFacade['subscribe'];
  public readonly tick: ReplicatedStrFacade['tick'];

  /**
   * @param store JsonPatchStore instance which wraps a "str" node.
   */
  constructor(
    protected readonly store: JsonPatchStore<any> | JsonPatchStoreStrict,
    protected readonly strict: boolean = false,
  ) {
    this.view = store.getSnapshot as unknown as ReplicatedStrFacade['view'];
    this.ins = (pos: number, str: string) => {
      store.update({op: 'str_ins', path: [], pos, str});
    };
    this.del = (pos: number, len: number) => {
      store.update({op: 'str_del', path: [], pos, len});
    };
    this.subscribe = store.subscribe;
    this.tick = strict
      ? undefined
      : () => ((<JsonPatchStore<any>>this.store).api?.() as StrApi)?.asStr?.().api.model.tick ?? 0;
  }

  get findId(): undefined | ReplicatedStrFacade['findId'] {
    if (this.strict) return void 0;
    const str = ((<JsonPatchStore<any>>this.store).api?.() as StrApi)?.asStr?.();
    if (!str) return void 0;
    return str.findId.bind(str);
  }

  get findPos(): undefined | ReplicatedStrFacade['findPos'] {
    if (this.strict) return void 0;
    const str = ((<JsonPatchStore<any>>this.store).api?.() as StrApi)?.asStr?.();
    if (!str) return void 0;
    return str.findPos.bind(str);
  }

  get transaction(): undefined | ReplicatedStrFacade['transaction'] {
    if (this.strict) return void 0;
    const str = ((<JsonPatchStore<any>>this.store).api?.() as StrApi)?.asStr?.();
    if (!str) return void 0;
    return str.api.transaction.bind(str.api);
  }
}
