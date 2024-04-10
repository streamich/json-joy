/**
 * @jest-environment node
 */

import {ApiTestSetup, runApiTests} from '../../../../common/rpc/__tests__/runApiTests';
import {RpcCodecs} from '../../../../common/codec/RpcCodecs';
import {RpcMessageCodecs} from '../../../../common/codec/RpcMessageCodecs';
import {Writer} from '@jsonjoy.com/util/lib/buffers/Writer';
import {Codecs} from '@jsonjoy.com/json-pack/lib/codecs/Codecs';
import {RpcMessageCodec} from '../../../../common/codec/types';
import {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import {FetchRpcClient} from '../../../../common/rpc/client/FetchRpcClient';

if (process.env.TEST_E2E) {
  const codecs = new RpcCodecs(new Codecs(new Writer()), new RpcMessageCodecs());
  const {binary, compact, jsonRpc2} = codecs.messages;
  const {json, cbor, msgpack} = codecs.value;
  const cases: [specifier: string, protocol: RpcMessageCodec, req: JsonValueCodec, res: JsonValueCodec][] = [
    ['rpc.rx.compact.json', compact, json, json],
    ['rpc.rx.compact.cbor', compact, cbor, cbor],
    ['rpc.rx.compact.msgpack', compact, msgpack, msgpack],
    ['rpc.rx.compact.json-cbor', compact, json, cbor],
    ['rpc.rx.compact.json-msgpack', compact, json, msgpack],
    ['rpc.rx.compact.cbor-json', compact, cbor, json],
    ['rpc.rx.compact.cbor-msgpack', compact, cbor, msgpack],
    ['rpc.rx.compact.msgpack-json', compact, msgpack, json],
    ['rpc.rx.compact.msgpack-cbor', compact, msgpack, cbor],

    ['rpc.rx.binary.cbor', binary, cbor, cbor],
    ['rpc.rx.binary.msgpack', binary, msgpack, msgpack],
    ['rpc.rx.binary.json', binary, json, json],
    ['rpc.rx.binary.json-cbor', binary, json, cbor],
    ['rpc.rx.binary.json-msgpack', binary, json, msgpack],
    ['rpc.rx.binary.cbor-json', binary, cbor, json],
    ['rpc.rx.binary.cbor-msgpack', binary, cbor, msgpack],
    ['rpc.rx.binary.msgpack-json', binary, msgpack, json],
    ['rpc.rx.binary.msgpack-cbor', binary, msgpack, cbor],

    ['rpc.json2.verbose.json', jsonRpc2, json, json],
    ['rpc.json2.verbose.cbor', jsonRpc2, cbor, cbor],
    ['rpc.json2.verbose.msgpack', jsonRpc2, msgpack, msgpack],
    ['rpc.json2.verbose.json-cbor', jsonRpc2, json, cbor],
    ['rpc.json2.verbose.json-msgpack', jsonRpc2, json, msgpack],
    ['rpc.json2.verbose.cbor-json', jsonRpc2, cbor, json],
    ['rpc.json2.verbose.cbor-msgpack', jsonRpc2, cbor, msgpack],
    ['rpc.json2.verbose.msgpack-json', jsonRpc2, msgpack, json],
    ['rpc.json2.verbose.msgpack-cbor', jsonRpc2, msgpack, cbor],
  ];

  for (const [protocolSpecifier, msgCodec, reqCodec, resCodec] of cases) {
    const setup: ApiTestSetup = async () => {
      const port = +(process.env.PORT || 9999);
      const url = `http://localhost:${port}/rpc`;
      const client = new FetchRpcClient({
        url,
        msgCodec,
        reqCodec,
        resCodec,
      });
      return {client};
    };
    describe(`Content-Type: application/x.${protocolSpecifier}`, () => {
      runApiTests(setup, {staticOnly: true});
    });
  }
} else {
  test.skip('set TEST_E2E=1 env var to run this test suite', () => {});
}
