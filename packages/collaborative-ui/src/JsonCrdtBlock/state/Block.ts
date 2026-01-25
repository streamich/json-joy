import type {EditSession} from 'json-crdt-repo/lib/session/EditSession';
import type {JsonCrdtRepo} from 'json-crdt-repo';

export class Block {
  constructor(
    public readonly id: string,
    public readonly session: EditSession,
    public readonly repo: JsonCrdtRepo,
  ) {}
}
