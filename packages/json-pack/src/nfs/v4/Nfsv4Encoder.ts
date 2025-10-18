import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {XdrEncoder} from '../../xdr/XdrEncoder';
import type * as msg from './messages';
import type {IWriter, IWriterGrowable} from '@jsonjoy.com/buffers';

export class Nfsv4Encoder<W extends IWriter & IWriterGrowable = IWriter & IWriterGrowable> {
  public readonly xdr: XdrEncoder;

  constructor(public readonly writer: W = new Writer() as any) {
    this.xdr = new XdrEncoder(writer);
  }

  public encodeCompound(
    compound: msg.Nfsv4CompoundRequest | msg.Nfsv4CompoundResponse,
    isRequest?: boolean,
  ): Uint8Array {
    compound.encode(this.xdr);
    return this.writer.flush();
  }

  public writeCompound(compound: msg.Nfsv4CompoundRequest | msg.Nfsv4CompoundResponse, isRequest: boolean): void {
    compound.encode(this.xdr);
  }

  public encodeCbCompound(
    compound: msg.Nfsv4CbCompoundRequest | msg.Nfsv4CbCompoundResponse,
    isRequest?: boolean,
  ): Uint8Array {
    compound.encode(this.xdr);
    return this.writer.flush();
  }

  public writeCbCompound(compound: msg.Nfsv4CbCompoundRequest | msg.Nfsv4CbCompoundResponse, isRequest: boolean): void {
    compound.encode(this.xdr);
  }
}
