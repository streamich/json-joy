import type {Patch} from '../../json-crdt-patch';
import {ClockTable} from '../../json-crdt-patch/codec/clock/ClockTable';
import type {Decoder} from '../codec/indexed/binary/Decoder';
import type {Encoder} from '../codec/indexed/binary/Encoder';
import type {IndexedFields, FieldName, IndexedNodeFields} from '../codec/indexed/binary/types';
import {PartialEditModel} from './PartialEditModel';
import type {IJsonCrdtPatchEditOperation} from '../../json-crdt-patch/types';
import type {FieldEdits} from './types';

export class PartialEdit {
  /** List of fields/nodes to fetch before applying the patches. */
  loadList = new Set<string>();
  doc: PartialEditModel | null = null;

  constructor(
    protected readonly decoder: Decoder,
    protected readonly encoder: Encoder,
    public readonly clockTable: ClockTable = new ClockTable(),
  ) {}

  public populateLoadList(patch: Patch): void {
    const ops = patch.ops;
    const length = ops.length;
    const loadList = this.loadList;
    for (let i = 0; i < length; i++) {
      const op = ops[i];
      const obj = (op as Partial<IJsonCrdtPatchEditOperation>).obj;
      if (obj) {
        if (obj.sid === 0) {
          loadList.add('r');
          continue;
        }
        const entry = this.clockTable.bySid.get(obj.sid);
        if (!entry) continue;
        const fieldName: FieldName = `${entry.index.toString(36)}_${obj.time.toString(36)}`;
        loadList.add(fieldName);
      }
    }
  }

  public getFieldsToLoad(): Set<string> {
    return this.loadList;
  }

  public loadPartialModel(fields: IndexedNodeFields): PartialEditModel {
    this.doc = this.decoder.decodeFields(this.clockTable, fields, PartialEditModel);
    return this.doc;
  }

  public applyPatch(patch: Patch) {
    this.doc!.applyPatch(patch);
  }

  public populateClockTable(): void {
    const doc = this.doc!;
    const peers = doc.clock.peers;
    const clockTable = this.clockTable;
    peers.forEach((clock, sid) => {
      if (!clockTable.bySid.has(sid)) {
        clockTable.push(clock);
      }
    });
  }

  public getFieldEdits(): FieldEdits {
    const doc = this.doc!;
    const updates = this.encoder.encode(doc, this.clockTable);
    const clockTable = this.clockTable;
    const deletedIds = doc.deletes;
    const length = deletedIds.length;
    const deletes = new Set<FieldName>();
    for (let i = 0; i < length; i++) {
      const id = deletedIds[i];
      const field: FieldName = `${clockTable.getBySid(id.sid).index}_${id.time.toString(36)}`;
      deletes.add(field);
    }
    return {
      updates,
      deletes,
    };
  }
}

export class PartialEditFactory {
  constructor(
    protected readonly decoder: Decoder,
    protected readonly encoder: Encoder,
  ) {}

  public startPartialEdit(clockBlob: IndexedFields['c']): PartialEdit {
    const reader = this.decoder.dec.reader;
    reader.reset(clockBlob);
    const clockTable = ClockTable.decode(reader);
    const partialEdit = new PartialEdit(this.decoder, this.encoder, clockTable);
    return partialEdit;
  }
}
