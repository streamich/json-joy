import type {ITimestampStruct} from 'json-joy/lib/json-crdt';
import type {CollaborativeStr} from '../types';
import type {ReplicatedStrFacade} from './types';

const ID: ITimestampStruct = {sid: 0, time: 0};

export class ReplicatedStr implements CollaborativeStr {
  public readonly view: () => string;
  public readonly ins: (pos: number, text: string) => void;
  public readonly del: (pos: number, length: number) => void;
  public readonly findId: CollaborativeStr['findId'];
  public readonly findPos: CollaborativeStr['findPos'];
  public readonly api: CollaborativeStr['api'];

  constructor(protected readonly facade: ReplicatedStrFacade) {
    this.view = facade.view;
    this.ins = facade.ins;
    this.del = facade.del;
    this.findId = facade.findId ?? (() => ID);
    this.findPos = facade.findPos ?? (() => -1);
    this.api = {
      onChange: {
        listen: this.facade.subscribe,
      },
      transaction: (callback: () => void): void => {
        if (facade.transaction) facade.transaction(callback);
        else callback();
      },
      model: {
        get tick(): number {
          return facade.tick?.() ?? 0;
        },
      },
    };
  }
}
