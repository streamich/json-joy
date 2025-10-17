# NFSv3 TCP Server Demo

This demo shows how to create a simple NFSv3 server that listens on a TCP socket and decodes incoming NFSv3 packets.

## What it does

1. Starts a TCP server on `127.0.0.1:2049` (default NFS port)
2. Accepts incoming connections
3. Receives TCP data and prints it in hexadecimal format
4. Decodes RPC record marking (RM) frames
5. Decodes RPC call messages
6. Decodes NFSv3 procedure calls
7. Pretty-prints all decoded information to the console

## Running the demo

```bash
# Build the project first
npm run build

# Run the demo
node lib/nfs/v3/__demos__/tcp-server.js
```

Or run directly with ts-node:

```bash
npx ts-node src/nfs/v3/__demos__/tcp-server.ts
```

## Testing the server

You can test the server using various methods:

### Using the included test client

First, start the server in one terminal:

```bash
npx ts-node src/nfs/v3/__demos__/tcp-server.ts
```

Then, in another terminal, run the test client:

```bash
npx ts-node src/nfs/v3/__demos__/tcp-client.ts
```

The test client will send a GETATTR request to the server, and you'll see the decoded output in the server terminal.

### Using a real NFS client

```bash
# Mount the NFS server (will likely fail since we only decode, not respond)
mount -t nfs -o vers=3,tcp 127.0.0.1:/ /mnt/test
```

### Using netcat to send raw data

```bash
# Send raw bytes to test the decoder
echo -n "80000028000000010000000200000003000000010000000000000000000000000000000000000008010203040506" | xxd -r -p | nc 127.0.0.1 2049
```

## Output Example

When a client connects and sends data, you'll see output like:

```
13:53 $ npx ts-node src/nfs/v3/__demos__/tcp-server.ts
NFSv3 TCP Server listening on 127.0.0.1:2049
Waiting for connections...

[2025-10-08T11:53:14.082Z] Client connected from 127.0.0.1:59751

================================================================================
[2025-10-08T11:53:14.084Z] Received 56 bytes
HEX: 80000034000030390000000000000002000186a3000000030000000100000000000000000000000000000000000000080102030405060708
--------------------------------------------------------------------------------

RPC Record (52 bytes):
HEX: 000030390000000000000002000186a3000000030000000100000000000000000000000000000000000000080102030405060708

RPC Message:
RpcCallMessage {
  xid: 12345,
  rpcvers: 2,
  prog: 100003,
  vers: 3,
  proc: 1,
  cred: RpcOpaqueAuth {
    flavor: 0,
    body: Reader { uint8: Uint8Array(0) [], view: [DataView], x: 0, end: 0 }
  },
  verf: RpcOpaqueAuth {
    flavor: 0,
    body: Reader { uint8: Uint8Array(0) [], view: [DataView], x: 0, end: 0 }
  },
  params: Reader {
    uint8: Uint8Array(16384) [
      128, 0, 0, 52, 0, 0,  48,  57, 0, 0, 0, 0,
        0, 0, 0,  2, 0, 1, 134, 163, 0, 0, 0, 3,
        0, 0, 0,  1, 0, 0,   0,   0, 0, 0, 0, 0,
        0, 0, 0,  0, 0, 0,   0,   0, 0, 0, 0, 8,
        1, 2, 3,  4, 5, 6,   7,   8, 0, 0, 0, 0,
        0, 0, 0,  0, 0, 0,   0,   0, 0, 0, 0, 0,
        0, 0, 0,  0, 0, 0,   0,   0, 0, 0, 0, 0,
        0, 0, 0,  0, 0, 0,   0,   0, 0, 0, 0, 0,
        0, 0, 0,  0,
      ... 16284 more items
    ],
    view: DataView {
      byteLength: 16384,
      byteOffset: 0,
      buffer: [ArrayBuffer]
    },
    x: 44,
    end: 56
  }
}

NFS Procedure: GETATTR

NFS Message:
Nfsv3GetattrRequest {
  object: Nfsv3Fh {
    data: Reader { uint8: [Uint8Array], view: [DataView], x: 0, end: 8 }
  }
}
================================================================================

[2025-10-08T11:53:14.183Z] Client disconnected
```

## Stopping the server

Press `Ctrl+C` to gracefully shut down the server.
