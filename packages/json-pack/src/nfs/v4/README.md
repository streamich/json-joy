# NFSv4 Protocol Implementation

This directory contains an implementation of the NFSv4 protocol data structures based on RFC 7530 and RFC 7531.

## Overview

NFSv4 is a distributed file system protocol that integrates:
- Traditional file access operations
- File locking (integrated, unlike NFSv3 which used separate NLM protocol)
- Mount protocol (integrated, unlike NFSv3 which used separate MOUNT protocol)
- Strong security with RPCSEC_GSS
- COMPOUND operations for reduced latency
- Client caching and delegations
- Internationalization support

## `FullNfsv4Encoder`

`FullNfsv4Encoder` is an optimized encoder that combines all three protocol layers (RM, RPC, and NFS)
into a single-pass encoding operation, eliminating intermediate data copying.

### Encoding NFS Requests (Call Messages)

```typescript
import {FullNfsv4Encoder} from '@jsonjoy.com/json-pack/lib/nfs/v4';
import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import * as msg from '@jsonjoy.com/json-pack/lib/nfs/v4/messages';
import * as structs from '@jsonjoy.com/json-pack/lib/nfs/v4/structs';

// Create the encoder
const encoder = new FullNfsv4Encoder();

// Create NFSv4 COMPOUND request
const fhData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
const putfh = new msg.Nfsv4PutfhRequest(new structs.Nfsv4Fh(fhData));
const getattr = new msg.Nfsv4GetattrRequest(new structs.Nfsv4Bitmap([0, 1]));
const request = new msg.Nfsv4CompoundRequest('getattr', 0, [putfh, getattr]);

// Create RPC authentication
const cred = {
  flavor: 0,
  body: new Reader(new Uint8Array()),
};
const verf = {
  flavor: 0,
  body: new Reader(new Uint8Array()),
};

// Encode the complete NFS call (RM + RPC + NFS layers)
const encoded = encoder.encodeCall(
  12345, // XID
  Nfsv4Proc.COMPOUND, // Procedure
  cred, // Credentials
  verf, // Verifier
  request, // NFSv4 COMPOUND request
);

// Send the encoded data over TCP
socket.write(encoded);
```

### NFSv4 COMPOUND Operations

NFSv4 uses a COMPOUND-based architecture where multiple operations are bundled into a single RPC call:

```typescript
// Multi-operation COMPOUND request
const putfh = new msg.Nfsv4PutfhRequest(new structs.Nfsv4Fh(fhData));
const lookup = new msg.Nfsv4LookupRequest('file.txt');
const getfh = new msg.Nfsv4GetfhRequest();
const read = new msg.Nfsv4ReadRequest(stateid, BigInt(0), 4096);

const request = new msg.Nfsv4CompoundRequest('read-file', 0, [
  putfh,
  lookup,
  getfh,
  read,
]);

const encoded = encoder.encodeCall(xid, Nfsv4Proc.COMPOUND, cred, verf, request);
```

### Comparison with Separate Encoders

Traditional approach (3 copies):

```typescript
// Step 1: Encode NFS layer
const nfsEncoded = nfsEncoder.encodeCompound(request, true);

// Step 2: Encode RPC layer (copies NFS data)
const rpcEncoded = rpcEncoder.encodeCall(xid, prog, vers, proc, cred, verf, nfsEncoded);

// Step 3: Encode RM layer (copies RPC data)
const rmEncoded = rmEncoder.encodeRecord(rpcEncoded);
```

Optimized approach (zero copies):

```typescript
// Single-pass encoding - writes all layers directly to output buffer
const encoded = fullEncoder.encodeCall(xid, proc, cred, verf, request);
```

### Encoding Response Messages

```typescript
// Create NFSv4 COMPOUND response
const putfhRes = new msg.Nfsv4PutfhResponse(Nfsv4Stat.NFS4_OK);
const getattrRes = new msg.Nfsv4GetattrResponse(
  Nfsv4Stat.NFS4_OK,
  new msg.Nfsv4GetattrResOk(fattr),
);
const response = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, 'getattr', [
  putfhRes,
  getattrRes,
]);

// Encode the complete NFS reply (RM + RPC + NFS layers)
const encoded = encoder.encodeAcceptedReply(xid, proc, verf, response);
```

## References

- [RFC 7530](https://tools.ietf.org/html/rfc7530): NFSv4 Protocol
- [RFC 7531](https://tools.ietf.org/html/rfc7531): NFSv4 XDR Description
