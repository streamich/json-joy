// TODO: package.json declares none of `@jsonjoy.com/buffers`, `json-pack`,
// `rpc-codec-binary` or `rpc-codec-compact`.
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {CborJsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/cbor';
import {FetchCaller} from '@jsonjoy.com/rpc-calls/lib/caller/FetchCaller';
import {RpcBinBatchCodec} from '@jsonjoy.com/rpc-codec/lib/RpcBinBatchCodec';
import {RpcCodec} from '@jsonjoy.com/rpc-codec/lib/RpcCodec';
import {RxCompactMessageCodec} from '@jsonjoy.com/rpc-codec-compact';
import type {CallerMethods} from '@jsonjoy.com/rpc-calls/lib/caller/types';
import type {RxMessage} from '@jsonjoy.com/rpc-messages';

export const createFetchClient = <Methods extends CallerMethods<any> = CallerMethods>(
  url: string,
  token?: string,
): FetchCaller<Methods> => {
  const writer = new Writer(1024 * 4);
  const val = new CborJsonValueCodec(writer);
  const codec = new RpcCodec<RxMessage>(new RxCompactMessageCodec(), val, val);
  const headers: Record<string, string> = {'Content-Type': 'application/x.' + codec.specifier()};
  if (token) headers.Authorization = token;
  return new FetchCaller<Methods>({url, codec: new RpcBinBatchCodec(codec), headers});
};
