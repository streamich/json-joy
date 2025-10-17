# NFSv4 TCP Server Demo

This demo shows how to create a simple NFSv4 server that listens on a TCP socket and decodes incoming NFSv4 packets.

## What it does

1. Starts a TCP server on `127.0.0.1:2049` (default NFS port)
2. Accepts incoming connections
3. Receives TCP data and prints it in hexadecimal format
4. Decodes RPC record marking (RM) frames
5. Decodes RPC call messages
6. Decodes NFSv4 COMPOUND procedure calls
7. Pretty-prints all decoded information to the console, including individual operations within COMPOUND requests

## Running the demo

```bash
# Build the project first
npm run build

# Run the demo
node lib/nfs/v4/server/__demos__/tcp-server.js
```

Or run directly with ts-node:

```bash
npx ts-node src/nfs/v4/server/__demos__/tcp-server.ts
```

You can also specify a custom port:

```bash
PORT=8777 npx ts-node src/nfs/v4/server/__demos__/tcp-server.ts
```

Then mount an NFSv4 share from another terminal or machine:

```bash
mount -t nfs -o vers=4,nfsvers=4,port=8777,mountport=8777,proto=tcp,sec=none,noowners 127.0.0.1:/export ~/mnt/test
```

Unmount with:

```bash
sudo umount -f ~/mnt/test
```

You might need to clean all hanging `mount_nfs` processes if previous mounts failed.

```bash
sudo pkill -9 -f "ts-node.*tcp-server"; sudo pkill -9 mount_nfs
```

## NFSv4 Protocol Structure

NFSv4 differs from NFSv3 in that it uses COMPOUND procedures to bundle multiple operations:

- **NULL (procedure 0)**: Standard no-op procedure
- **COMPOUND (procedure 1)**: Container for one or more NFSv4 operations

Each COMPOUND request contains:
- `tag`: Client-defined string for request identification
- `minorversion`: NFSv4 minor version number (0 for NFSv4.0)
- `argarray`: Array of operations to execute

## Supported Operations

The demo can decode all NFSv4 operations including:

- **File access**: ACCESS, GETATTR, GETFH, LOOKUP, LOOKUPP, READ, READDIR, READLINK
- **File modification**: WRITE, CREATE, REMOVE, RENAME, LINK, SETATTR, COMMIT
- **File handles**: PUTFH, PUTPUBFH, PUTROOTFH, SAVEFH, RESTOREFH
- **State management**: OPEN, CLOSE, LOCK, LOCKT, LOCKU, OPEN_CONFIRM, OPEN_DOWNGRADE
- **Client/Session**: SETCLIENTID, SETCLIENTID_CONFIRM, RENEW, RELEASE_LOCKOWNER
- **Delegations**: DELEGPURGE, DELEGRETURN
- **Other**: VERIFY, NVERIFY, SECINFO, OPENATTR

## Example Output

When a client sends a COMPOUND request, you'll see output like:

```
================================================================================
[2023-10-09T12:34:56.789Z] Received 128 bytes
HEX: 80000078000000011b8b45f200000000...
--------------------------------------------------------------------------------

RPC Record (120 bytes):
HEX: 000000011b8b45f200000000...

RPC Message:
RpcCallMessage {
  xid: 463701234,
  rpcvers: 2,
  prog: 100003,
  vers: 4,
  proc: 1,
  ...
}

NFS Procedure: COMPOUND

NFS COMPOUND Request:
  Tag: "nfs4_client"
  Minor Version: 0
  Operations (3):
    [0] PUTFH
        {
          "op": 22,
          "fh": <Buffer 00 01 02 ...>
        }
    [1] LOOKUP
        {
          "op": 15,
          "name": "file.txt"
        }
    [2] GETFH
        {
          "op": 10
        }
================================================================================
```

## Testing the server

You can test the server using:

1. **Real NFS clients**: Configure an NFSv4 client to connect to `127.0.0.1:2049`
2. **Custom test scripts**: Create TypeScript/JavaScript clients using the `FullNfsv4Encoder`
3. **Network tools**: Use tools like `tcpreplay` to replay captured NFSv4 traffic

## Notes

- This is a **demo/debugging tool** only - it does not respond to requests or implement a full NFS server
- The server only decodes and displays incoming requests
- Port 2049 may require root/admin privileges on some systems
- Use a custom port (e.g., `PORT=8585`) to avoid privilege requirements
