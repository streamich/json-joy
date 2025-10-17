import {JsonEncoderStable} from './JsonEncoderStable';
import {createToBase64Bin} from '@jsonjoy.com/base64/lib/createToBase64Bin';

const objBaseLength = '{"/":{"bytes":""}}'.length;
const cidBaseLength = '{"/":""}'.length;
const base64Encode = createToBase64Bin(undefined, '');

/**
 * Base class for implementing DAG-JSON encoders.
 *
 * @see https://ipld.io/specs/codecs/dag-json/spec/
 */
export class JsonEncoderDag extends JsonEncoderStable {
  /**
   * Encodes binary data as nested `["/", "bytes"]` object encoded in Base64
   * without padding.
   *
   * Example:
   *
   * ```json
   * {"/":{"bytes":"aGVsbG8gd29ybGQ"}}
   * ```
   *
   * @param buf Binary data to write.
   */
  public writeBin(buf: Uint8Array): void {
    const writer = this.writer;
    const length = buf.length;
    writer.ensureCapacity(objBaseLength + (length << 1));
    const view = writer.view;
    const uint8 = writer.uint8;
    let x = writer.x;
    view.setUint32(x, 0x7b222f22); // {"/"
    x += 4;
    view.setUint32(x, 0x3a7b2262); // :{"b
    x += 4;
    view.setUint32(x, 0x79746573); // ytes
    x += 4;
    view.setUint16(x, 0x223a); // ":
    x += 2;
    uint8[x] = 0x22; // "
    x += 1;
    x = base64Encode(buf, 0, length, view, x);
    view.setUint16(x, 0x227d); // "}
    x += 2;
    uint8[x] = 0x7d; // }
    x += 1;
    writer.x = x;
  }

  public writeCid(cid: string): void {
    const writer = this.writer;
    writer.ensureCapacity(cidBaseLength + cid.length);
    writer.u32(0x7b222f22); // {"/"
    writer.u16(0x3a22); // :"
    writer.ascii(cid);
    writer.u16(0x227d); // "}
  }
}
