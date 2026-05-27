## Reactive RPC codec

Aggregator package for all [Reactive RPC](/specs/json-rx) message codecs. It
re-exports `RpcCodec`, `RpcCodecs`, `RpcMessageCodecs`, and `JsonCompactMsgCodec`,
covering the Compact, Binary, and JSON-RPC 2.0 message formats.


## Installation

```
npm install @jsonjoy.com/rpc-codec
```


## Usage

```ts
import {RpcCodec, RpcMessageCodecs, RpcCodecs} from '@jsonjoy.com/rpc-codec';
```
