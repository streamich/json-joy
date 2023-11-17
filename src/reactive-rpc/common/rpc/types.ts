export * from './client/types';
export * from './methods/types';
export * from './caller/types';

export type RpcSpecifier = RpcSpecifierRx | RpcSpecifierJson2;
type RpcSpecifierRx = `rpc.rx.${'binary' | 'compact'}.${RpcSpecifierEncoding}`;
type RpcSpecifierJson2 = `rpc.json2.verbose.${RpcSpecifierEncoding}`;
type RpcSpecifierEncoding = 'cbor' | 'json' | 'msgpack';
