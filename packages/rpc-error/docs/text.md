## Reactive RPC error

The `RpcError` class and error codes for [Reactive RPC](/specs/json-rx) APIs.
`RpcError` extends `Error` and carries a `code` (string), `errno` (number), and
optional `errorId`, `meta`, and `originalError`.


## Installation

```
npm install @jsonjoy.com/rpc-error
```


## Usage

```ts
import {RpcError, RpcErrorCodes} from '@jsonjoy.com/rpc-error';

RpcError.fromCode('CONFLICT', 'Already exists');
RpcError.notFound('User not found');
RpcError.badRequest('Invalid input', meta);
RpcError.from(unknownError); // wrap as INTERNAL_ERROR
```
