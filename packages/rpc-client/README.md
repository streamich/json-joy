# `@jsonjoy.com/rpc-client`

Browser client for [JSON Reactive RPC](https://jsonjoy.com/specs/json-rx)
servers. Connects to an [`@jsonjoy.com/rpc-server`](../rpc-server) instance
over WebSocket or HTTP and provides typed RPC calls with support for
streaming, request/response, and notifications.

## Features

- **WebSocket** and **HTTP (fetch)** transports via [`@jsonjoy.com/channel`](../channel)
- Multiple codec support: Compact, Binary, JSON-RPC 2.0
- Automatic reconnection via `PersistentChannel`
- TypeScript-typed RPC calls

## Installation

```bash
npm install @jsonjoy.com/rpc-client
```

## Usage

### Connect to a JSON CRDT Server

```typescript
import {createBinaryClient} from '@jsonjoy.com/rpc-client';

// Connect over WebSocket with binary codec
const client = createBinaryClient('wss://pub-1-api.jsonjoy.org/rx');

// Make RPC calls
const pong = await client.call('util.ping', undefined);
console.log(pong); // "pong"
```

### Related Packages

| Package | Description |
|---|---|
| [`@jsonjoy.com/rpc-server`](../rpc-server) | Server counterpart |
| [`@jsonjoy.com/rpc-messages`](../rpc-messages) | JSON Rx protocol message types |
| [`@jsonjoy.com/rpc-codec`](../rpc-codec) | Message codec implementations |
| [`@jsonjoy.com/channel`](../channel) | Transport abstraction (WebSocket, fetch) |
| [`@jsonjoy.com/json-crdt-repo`](../json-crdt-repo) | Local-first client built on this package |
