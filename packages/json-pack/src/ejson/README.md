# EJSON v2 (MongoDB Extended JSON) Codec

This directory contains the implementation of MongoDB Extended JSON v2 codec, providing high-performance encoding and decoding functionality for BSON types in JSON format.

## Performance Optimizations

**High-Performance Binary Encoding**: The implementation uses `Writer` and `Reader` directly to output raw bytes without intermediate JSON representations, following the same pattern as `JsonEncoder` and `JsonDecoder` for optimal performance.

## Features

**EjsonEncoder** - Supports both encoding modes:
- **Canonical Mode**: Preserves all type information using explicit type wrappers like `{"$numberInt": "42"}`
- **Relaxed Mode**: Uses native JSON types where possible for better readability (e.g., `42` instead of `{"$numberInt": "42"}`)

**EjsonDecoder** - Strict parsing with comprehensive validation:
- Validates exact key matches for type wrappers
- Throws descriptive errors for malformed input
- Supports both canonical and relaxed format parsing

## Basic Usage

```ts
import {EjsonEncoder, EjsonDecoder} from '@jsonjoy.com/json-pack/lib/ejson';

const encoder = new EjsonEncoder();
const decoder = new EjsonDecoder();

const data = {
  _id: new BsonObjectId(0x507f1f77, 0xbcf86cd799, 0x439011),
  count: new BsonInt64(9223372036854775807),
  created: new Date('2023-01-15T10:30:00.000Z')
};

const encoded = encoder.encode(data);
const decoded = decoder.decode(encoded);

console.log(decoded); // Original data with BSON types preserved
```

## Advanced Usage

### Binary-First API (Recommended for Performance)

```typescript
import {EjsonEncoder, EjsonDecoder} from '@jsonjoy.com/json-pack/lib/ejson';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

const writer = new Writer();
const encoder = new EjsonEncoder(writer, { canonical: true });
const decoder = new EjsonDecoder();

// Encode to bytes
const bytes = encoder.encode(data);

// Decode from bytes
const result = decoder.decode(bytes);
```

### String API (For Compatibility)

```typescript
import {createEjsonEncoder, createEjsonDecoder} from '@jsonjoy.com/json-pack/lib/ejson';

const encoder = createEjsonEncoder({ canonical: true });
const decoder = createEjsonDecoder();

// Encode to string
const jsonString = encoder.encodeToString(data);

// Decode from string
const result = decoder.decodeFromString(jsonString);
```

## Supported BSON Types

The implementation supports all BSON types as per the MongoDB specification:

- **ObjectId**: `{"$oid": "507f1f77bcf86cd799439011"}`
- **Numbers**: Int32, Int64, Double with proper canonical/relaxed handling
- **Decimal128**: `{"$numberDecimal": "123.456"}`
- **Binary & UUID**: Full base64 encoding with subtype support
- **Code & CodeWScope**: JavaScript code with optional scope
- **Dates**: ISO-8601 format (relaxed) or timestamp (canonical)
- **RegExp**: Pattern and options preservation
- **Special types**: MinKey, MaxKey, Undefined, DBPointer, Symbol, Timestamp

## Examples

```typescript
import { createEjsonEncoder, createEjsonDecoder, BsonObjectId, BsonInt64 } from '@jsonjoy.com/json-pack/ejson2';

const data = {
  _id: new BsonObjectId(0x507f1f77, 0xbcf86cd799, 0x439011),
  count: new BsonInt64(9223372036854775807),
  created: new Date('2023-01-15T10:30:00.000Z')
};

// Canonical mode (preserves all type info)
const canonical = createEjsonEncoder({ canonical: true });
console.log(canonical.encodeToString(data));
// {"_id":{"$oid":"507f1f77bcf86cd799439011"},"count":{"$numberLong":"9223372036854775807"},"created":{"$date":{"$numberLong":"1673778600000"}}}

// Relaxed mode (more readable)
const relaxed = createEjsonEncoder({ canonical: false });
console.log(relaxed.encodeToString(data));
// {"_id":{"$oid":"507f1f77bcf86cd799439011"},"count":9223372036854775807,"created":{"$date":"2023-01-15T10:30:00.000Z"}}

// Decoding with validation
const decoder = createEjsonDecoder();
const decoded = decoder.decodeFromString(canonical.encodeToString(data));
console.log(decoded._id instanceof BsonObjectId); // true
```

## Implementation Details

- **High-Performance Binary Encoding**: Uses `Writer` and `Reader` directly to eliminate intermediate JSON string representations
- **Shared Value Classes**: Reuses existing BSON value classes from `src/bson/values.ts`
- **Strict Validation**: Prevents type wrappers with extra fields (e.g., `{"$oid": "...", "extra": "field"}` throws error)
- **Round-trip Compatibility**: Ensures encoding → decoding preserves data integrity
- **Error Handling**: Comprehensive error messages for debugging
- **Specification Compliant**: Follows MongoDB Extended JSON v2 specification exactly

## Testing

Added 54 comprehensive tests covering:
- All BSON type encoding/decoding in both modes
- Round-trip compatibility testing
- Error handling and edge cases
- Special numeric values (Infinity, NaN)
- Date handling for different year ranges
- Malformed input validation

All existing tests continue to pass, ensuring no breaking changes.