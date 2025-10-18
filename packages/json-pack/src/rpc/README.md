# RPC (Remote Procedure Call) Codec

This codec implements streaming encoder and decoder for ONC (Open Network Computing)
RPC protocol. It supports all three major RPC RFCs:

- **RFC 1057** (1988) - RPC: Remote Procedure Call, Version 2
- **RFC 1831** (1995) - RPC: Remote Procedure Call Protocol Specification Version 2
- **RFC 5531** (2009) - RPC: Remote Procedure Call Protocol Specification Version 2 (Internet Standard)

See `RFC_COMPLIANCE.md` for detailed information about supported features and differences between RFC versions.

## Note on Record Marking

This RPC codec handles only the RPC message encoding/decoding as specified in
RFC 1057. It does NOT include Record Marking (RM) which is used to frame
messages over byte streams like TCP.

For Record Marking support (as specified in RFC 1057 Section 10), use the
separate `rm` module. See `src/rm/README.md` for details.

## Usage

```typescript
import {RpcMessageEncoder, RpcMessageDecoder} from 'json-pack/rpc';
import {RmRecordEncoder, RmRecordDecoder} from 'json-pack/rm';

// Encoding an RPC message
const encoder = new RpcMessageEncoder();
const rpcMessage = encoder.encodeCall(xid, prog, vers, proc, cred, verf);

// For TCP transport, wrap with Record Marking
const rmEncoder = new RmRecordEncoder();
const framedMessage = rmEncoder.encodeRecord(rpcMessage);

// Decoding
const rmDecoder = new RmRecordDecoder();
const rpcDecoder = new RpcMessageDecoder();

// First extract the record from the byte stream (returns Reader)
rmDecoder.push(tcpData);
const record = rmDecoder.readRecord();

// Then decode the RPC message from the Reader
if (record) {
  const message = rpcDecoder.decodeMessage(record);
}
```
