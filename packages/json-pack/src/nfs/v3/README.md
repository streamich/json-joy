# NFSv3 Protocol Implementation

This directory contains a complete implementation of the NFSv3 protocol (RFC 1813), including:

- **NFSv3**: Core NFS version 3 protocol operations
- **MOUNT**: Mount protocol (Appendix I of RFC 1813)
- **NLM**: Network Lock Manager protocol version 4 (Appendix II of RFC 1813)

## `FullNfsv3Encoder`

`FullNfsv3Encoder` encoder that combines all three protocol layers (RM, RPC, and NFS)
into a single-pass encoding operation, eliminating intermediate data copying.

### Encoding NFS Requests (Call Messages)

```typescript
import {FullNfsv3Encoder} from '@jsonjoy.com/json-pack/lib/nfs/v3';
import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import * as msg from '@jsonjoy.com/json-pack/lib/nfs/v3/messages';
import * as structs from '@jsonjoy.com/json-pack/lib/nfs/v3/structs';

// Create the encoder
const encoder = new FullNfsv3Encoder();

// Create NFS request
const fhData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
const request = new msg.Nfsv3GetattrRequest(new structs.Nfsv3Fh(new Reader(fhData)));

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
  Nfsv3Proc.GETATTR, // Procedure
  cred, // Credentials
  verf, // Verifier
  request, // NFS request
);

// Send the encoded data over TCP
socket.write(encoded);
```

### Comparison with Separate Encoders

Traditional approach (3 copies):

```typescript
// Step 1: Encode NFS layer
const nfsEncoded = nfsEncoder.encodeMessage(request, proc, true);

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
