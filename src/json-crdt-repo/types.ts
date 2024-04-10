import type {Patch} from '../json-crdt-patch';
import type {Log} from '../json-crdt/log/Log';
import type {Model} from '../json-crdt/model';

export interface LocalHistory {
  create(collection: string[], log: Log): Promise<{id: string}>;
  read(collection: string[], id: string): Promise<{log: Log; cursor: string}>;
  readHistory(collection: string[], id: string, cursor: string): Promise<{log: Log; cursor: string}>;
  update(collection: string[], id: string, patches: Patch[]): Promise<void>;
  delete(collection: string[], id: string): Promise<void>;
}

export interface EditingSessionHistory {
  load(id: string): Promise<Model>;
  loadHistory(id: string): Promise<Log>;
  undo(id: string): Promise<void>;
  redo(id: string): Promise<void>;
}
