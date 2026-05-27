## Reactive RPC codec base

Base types and utilities shared by all [Reactive RPC](/specs/json-rx) message
codecs: the `MsgStreamCodec` and `MsgCodec` interfaces, codec format constants,
and the `getTypeEncoder` helper used by the codec implementations.


## Installation

```
npm install @jsonjoy.com/rpc-codec-base
```


## Usage

```ts
import {RpcMessageFormat} from '@jsonjoy.com/rpc-codec-base';
import type {MsgStreamCodec} from '@jsonjoy.com/rpc-codec-base';
```
