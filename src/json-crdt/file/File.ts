import {Model} from '../model';
import {PatchLog} from './PatchLog';
import {FileModelEncoding} from './constants';
import {Encoder as SidecarEncoder} from '../codec/sidecar/binary/Encoder';
import {Encoder as StructuralEncoderCompact} from '../codec/structural/compact/Encoder';
import {Encoder as StructuralEncoderVerbose} from '../codec/structural/verbose/Encoder';
import {encode as encodeCompact} from '../../json-crdt-patch/codec/compact/encode';
import {encode as encodeVerbose} from '../../json-crdt-patch/codec/verbose/encode';
import {Writer} from '../../util/buffers/Writer';
import {CborEncoder} from '../../json-pack/cbor/CborEncoder';
import {JsonEncoder} from '../../json-pack/json/JsonEncoder';
import {printTree} from '../../util/print/printTree';
import type * as types from './types';
import type {Printable} from '../../util/print/types';

export class File implements Printable {
  public static fromModel(model: Model<any>): File {
    return new File(model, PatchLog.fromModel(model));
  }

  constructor(public readonly model: Model, public readonly history: PatchLog) {}

  public serialize(params: types.FileSerializeParams = {}): types.FileWriteSequence {
    const view = this.model.view();
    const metadata: types.FileMetadata = [{}, FileModelEncoding.SidecarBinary];
    let model: Uint8Array | unknown | null = null;
    const modelFormat = params.model ?? 'sidecar';
    switch (modelFormat) {
      case 'sidecar': {
        metadata[1] = FileModelEncoding.SidecarBinary;
        const encoder = new SidecarEncoder();
        const [, uint8] = encoder.encode(this.model);
        model = uint8;
        break;
      }
      case 'binary': {
        metadata[1] = FileModelEncoding.StructuralBinary;
        model = this.model.toBinary();
        break;
      }
      case 'compact': {
        metadata[1] = FileModelEncoding.StructuralCompact;
        model = new StructuralEncoderCompact().encode(this.model);
        break;
      }
      case 'verbose': {
        metadata[1] = FileModelEncoding.StructuralVerbose;
        model = new StructuralEncoderVerbose().encode(this.model);
        break;
      }
      default:
        throw new Error(`Invalid model format: ${modelFormat}`);
    }
    const history: types.FileWriteSequenceHistory = [null, []];
    const patchFormat = params.history ?? 'binary';
    switch (patchFormat) {
      case 'binary': {
        history[0] = this.history.start.toBinary();
        this.history.patches.forEach(({v}) => {
          history[1].push(v.toBinary());
        });
        break;
      }
      case 'compact': {
        history[0] = new StructuralEncoderCompact().encode(this.history.start);
        this.history.patches.forEach(({v}) => {
          history[1].push(encodeCompact(v));
        });
        break;
      }
      case 'verbose': {
        history[0] = new StructuralEncoderVerbose().encode(this.history.start);
        this.history.patches.forEach(({v}) => {
          history[1].push(encodeVerbose(v));
        });
        break;
      }
      default:
        throw new Error(`Invalid history format: ${patchFormat}`);
    }
    return [view, metadata, model, history];
  }

  public toBinary(params: types.FileEncodingParams): Uint8Array {
    const sequence = this.serialize(params);
    const writer = new Writer(16 * 1024);
    switch (params.format) {
      case 'ndjson': {
        const json = new JsonEncoder(writer);
        for (const component of sequence) {
          json.writeAny(component);
          json.writer.u8('\n'.charCodeAt(0));
        }
        return json.writer.flush();
      }
      case 'seq.cbor': {
        const cbor = new CborEncoder(writer);
        for (const component of sequence) cbor.writeAny(component);
        return cbor.writer.flush();
      }
    }
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab?: string) {
    return `file` + printTree(tab, [(tab) => this.model.toString(tab), () => '', (tab) => this.history.toString(tab)]);
  }
}
