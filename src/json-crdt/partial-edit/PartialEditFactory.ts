import {ClockTable} from '../../json-crdt-patch/codec/clock/ClockTable';
import type {Decoder} from '../codec/indexed/binary/Decoder';
import type {Encoder} from '../codec/indexed/binary/Encoder';
import type {IndexedFields} from '../codec/indexed/binary/types';
import {PartialEdit} from './PartialEdit';

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
