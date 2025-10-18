import {RmRecordDecoder, RmRecordEncoder} from '../../../rm';
import {RpcCallMessage, RpcMessageDecoder, RpcMessageEncoder} from '../../../rpc';
import {Nfsv3Decoder} from '../Nfsv3Decoder';
import {Nfsv3Encoder} from '../Nfsv3Encoder';
import {FullNfsv3Encoder} from '../FullNfsv3Encoder';
import type * as msg from '../messages';
import {nfsv3} from './fixtures';

const rmDecoder = new RmRecordDecoder();
const rmEncoder = new RmRecordEncoder();
const rpcDecoder = new RpcMessageDecoder();
const rpcEncoder = new RpcMessageEncoder();
const nfsDecoder = new Nfsv3Decoder();
const nfsEncoder = new Nfsv3Encoder();
const fullNfsEncoder = new FullNfsv3Encoder();

const assertCallRoundtrip = (hex: string, fullEncoder: boolean = false): void => {
  const originalHex = hex.toLowerCase();
  const buffer = Buffer.from(originalHex, 'hex');
  rmDecoder.push(new Uint8Array(buffer));
  let totalEncodedHex = '';
  while (true) {
    const rmRecord = rmDecoder.readRecord();
    if (!rmRecord) break;
    const rpcMessage = rpcDecoder.decodeMessage(rmRecord);
    if (!(rpcMessage instanceof RpcCallMessage)) throw new Error(`Expected RPC Call message`);
    const nfsRequest = nfsDecoder.decodeMessage(rpcMessage.params!, rpcMessage.proc, true) as msg.Nfsv3Request;
    let rmEncoded: Uint8Array;
    if (fullEncoder) {
      rmEncoded = fullNfsEncoder.encodeCall(
        rpcMessage.xid,
        rpcMessage.proc,
        rpcMessage.cred,
        rpcMessage.verf,
        nfsRequest,
      );
    } else {
      const nfsEncoded = nfsEncoder.encodeMessage(nfsRequest, rpcMessage.proc, true);
      const rpcEncoded = rpcEncoder.encodeCall(
        rpcMessage.xid,
        rpcMessage.prog,
        rpcMessage.vers,
        rpcMessage.proc,
        rpcMessage.cred,
        rpcMessage.verf,
        nfsEncoded,
      );
      rmEncoded = rmEncoder.encodeRecord(rpcEncoded);
    }
    const encodedHex = Buffer.from(rmEncoded).toString('hex').toLowerCase();
    totalEncodedHex += encodedHex;
  }
  expect(totalEncodedHex).toBe(originalHex);
};

test('assert roundtrip of Call messages', () => {
  assertCallRoundtrip(nfsv3.GETATTR.Call[0], false);
  assertCallRoundtrip(nfsv3.GETATTR.Call[0], true);
  assertCallRoundtrip(nfsv3.GETATTR.Call[0] + nfsv3.ACCESS.Call[0], false);
  assertCallRoundtrip(nfsv3.GETATTR.Call[0] + nfsv3.ACCESS.Call[0], true);
  const stream =
    nfsv3.ACCESS.Call[0] +
    nfsv3.GETATTR.Call[0] +
    nfsv3.COMMIT.Call[0] +
    nfsv3.RMDIR.Call[0] +
    nfsv3.MKDIR.Call[0] +
    nfsv3.RMDIR.Call[0] +
    nfsv3.READDIRPLUS.Call[0] +
    nfsv3.REMOVE.Call[0] +
    nfsv3.CREATE.Call[0] +
    nfsv3.CREATE.Call[0] +
    nfsv3.LOOKUP.Call[0];
  assertCallRoundtrip(stream, false);
  assertCallRoundtrip(stream, true);
});
