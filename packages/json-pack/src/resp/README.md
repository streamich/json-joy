# RESP v2 and RESP3 codecs

Redis Serialization Protocol (RESP) implementation supporting both RESP2 and RESP3 formats.

## Overview

RESP is the protocol used by Redis to communicate between clients and servers. This implementation provides:

- **RESP3** encoder (`RespEncoder`) - Full support for all RESP3 data types
- **RESP2** encoder (`RespEncoderLegacy`) - Legacy RESP2 support  
- **RESP decoder** (`RespDecoder`) - Decodes both RESP2 and RESP3 formats
- **Streaming decoder** (`RespStreamingDecoder`) - For parsing streaming RESP data

## Supported Data Types

### RESP3 Types
- Simple strings
- Simple errors  
- Integers
- Bulk strings
- Arrays
- Nulls
- Booleans
- Doubles
- Maps
- Sets
- Attributes
- Push messages
- Verbatim strings

### RESP2 Types  
- Simple strings
- Errors
- Integers
- Bulk strings  
- Arrays

## Basic Usage

```ts
import {RespEncoder, RespDecoder} from '@jsonjoy.com/json-pack/lib/resp';

const encoder = new RespEncoder();
const decoder = new RespDecoder();

// Encode data
const data = {hello: 'world', count: 42};
const encoded = encoder.encode(data);

// Decode data
const decoded = decoder.decode(encoded);
console.log(decoded); // {hello: 'world', count: 42}
```

## Extensions

The RESP implementation supports Redis-specific extensions:

- **RespAttributes** - For attribute metadata
- **RespPush** - For push messages  
- **RespVerbatimString** - For verbatim strings with format info
