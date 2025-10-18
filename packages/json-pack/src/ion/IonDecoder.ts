import {IonDecoderBase} from './IonDecoderBase';
import {Import} from './Import';
import {systemSymbolImport} from './symbols';
import type {IReader, IReaderResettable} from '@jsonjoy.com/buffers/lib';

export class IonDecoder<R extends IReader & IReaderResettable = IReader & IReaderResettable> extends IonDecoderBase<R> {
  public decode(data: Uint8Array): unknown {
    this.reader.reset(data);

    // Initialize symbol table with system symbols
    this.symbols = new Import(systemSymbolImport, []);

    // Validate Binary Version Marker
    this.validateBVM();

    // Read symbol table if present
    this.readSymbolTable();

    // Read the main value
    return this.val();
  }

  public read(): unknown {
    return this.val();
  }
}
