# XDR Quick Reference Guide

## RFC Version Support

| Feature                       | RFC 1014 | RFC 1832 | RFC 4506 | Status         |
| ----------------------------- | -------- | -------- | -------- | -------------- |
| Basic types (int, bool, enum) | ✅       | ✅       | ✅       | ✅ Implemented |
| Hyper integers (64-bit)       | ✅       | ✅       | ✅       | ✅ Implemented |
| Float, Double                 | ✅       | ✅       | ✅       | ✅ Implemented |
| Quadruple (128-bit float)     | ❌       | ✅       | ✅       | ⚠️ Type only   |
| Opaque, String                | ✅       | ✅       | ✅       | ✅ Implemented |
| Array, Struct, Union          | ✅       | ✅       | ✅       | ✅ Implemented |
| Optional-data                 | ❌       | ✅       | ✅       | ✅ Implemented |
| Security guidelines           | ❌       | ❌       | ✅       | ✅ Implemented |

## Data Type Quick Reference

### Primitive Types

```typescript
// Integer types
{ type: 'int' }              // 32-bit signed: -2^31 to 2^31-1
{ type: 'unsigned_int' }     // 32-bit unsigned: 0 to 2^32-1
{ type: 'hyper' }            // 64-bit signed
{ type: 'unsigned_hyper' }   // 64-bit unsigned
{ type: 'boolean' }          // Encoded as int (0/1)

// Floating-point types
{ type: 'float' }            // IEEE 754 single-precision (32-bit)
{ type: 'double' }           // IEEE 754 double-precision (64-bit)
{ type: 'quadruple' }        // IEEE 754 quad-precision (128-bit) - not implemented

// Special types
{ type: 'void' }             // No data
{ type: 'enum', values: { RED: 0, GREEN: 1 } }
```

### Composite Types

```typescript
// Fixed-length opaque data
{ type: 'opaque', size: 16 }

// Variable-length opaque data (max size optional)
{ type: 'vopaque' }
{ type: 'vopaque', size: 1024 }

// String (max size optional)
{ type: 'string' }
{ type: 'string', size: 255 }

// Fixed-length array
{ type: 'array', elements: { type: 'int' }, size: 10 }

// Variable-length array (max size optional)
{ type: 'varray', elements: { type: 'int' } }
{ type: 'varray', elements: { type: 'int' }, size: 100 }

// Struct
{
  type: 'struct',
  fields: [
    [{ type: 'int' }, 'id'],
    [{ type: 'string' }, 'name']
  ]
}

// Union
{
  type: 'union',
  arms: [
    [0, { type: 'int' }],
    [1, { type: 'string' }]
  ],
  default?: { type: 'void' }
}

// Optional-data (NEW in RFC 1832)
{ type: 'optional', element: { type: 'int' } }
```

## Usage Examples

### Basic Encoding/Decoding

```typescript
import {XdrEncoder, XdrDecoder, Writer, Reader} from '@jsonjoy.com/json-pack';

// Encode
const writer = new Writer();
const encoder = new XdrEncoder(writer);
encoder.writeInt(42);
encoder.writeString('hello');
const encoded = writer.flush();

// Decode
const reader = new Reader();
const decoder = new XdrDecoder(reader);
reader.reset(encoded);
const num = decoder.readInt(); // 42
const str = decoder.readString(); // "hello"
```

### Schema-Based Encoding/Decoding

```typescript
import {XdrSchemaEncoder, XdrSchemaDecoder, Writer, Reader} from '@jsonjoy.com/json-pack';

const schema = {
  type: 'struct',
  fields: [
    [{type: 'int'}, 'id'],
    [{type: 'string', size: 100}, 'name'],
    [{type: 'boolean'}, 'active'],
  ],
};

// Encode
const writer = new Writer();
const encoder = new XdrSchemaEncoder(writer);
const data = {id: 1, name: 'Alice', active: true};
const encoded = encoder.encode(data, schema);

// Decode
const reader = new Reader();
const decoder = new XdrSchemaDecoder(reader);
const decoded = decoder.decode(encoded, schema);
// { id: 1, name: 'Alice', active: true }
```

### Optional-Data (RFC 1832)

```typescript
const schema = {
  type: 'optional',
  element: {type: 'int'},
};

// Encode optional value
encoder.writeOptional(42, schema); // Encodes: TRUE + 42
encoder.writeOptional(null, schema); // Encodes: FALSE
encoder.writeOptional(undefined, schema); // Encodes: FALSE

// Decode optional value
const value = decoder.readOptional(schema); // number | null
```

### Union Types

```typescript
import {XdrUnion} from '@jsonjoy.com/json-pack';

const schema = {
  type: 'union',
  arms: [
    [0, {type: 'int'}],
    [1, {type: 'string'}],
  ],
};

// Encode union
const intValue = new XdrUnion(0, 42);
const strValue = new XdrUnion(1, 'hello');
encoder.encode(intValue, schema);

// Decode union
const decoded = decoder.decode(data, schema); // XdrUnion instance
console.log(decoded.discriminant); // 0 or 1
console.log(decoded.value); // 42 or "hello"
```

### Schema Validation

```typescript
import {XdrSchemaValidator} from '@jsonjoy.com/json-pack';

const validator = new XdrSchemaValidator();

// Validate schema structure
const isValidSchema = validator.validateSchema(schema); // boolean

// Validate value against schema
const isValidValue = validator.validateValue(data, schema); // boolean
```

## Security Best Practices

### Always Use Size Limits

```typescript
// ❌ Bad - no maximum size
{ type: 'string' }
{ type: 'varray', elements: { type: 'int' } }

// ✅ Good - explicit maximum size
{ type: 'string', size: 1024 }
{ type: 'varray', elements: { type: 'int' }, size: 100 }
```

### Validate Before Encoding

```typescript
const validator = new XdrSchemaValidator();
if (!validator.validateValue(data, schema)) {
  throw new Error('Invalid data for schema');
}
encoder.encode(data, schema);
```

### Implement Depth Limits

```typescript
class SafeDecoder extends XdrSchemaDecoder {
  private depth = 0;
  private maxDepth = 100;

  decode(data: Uint8Array, schema: XdrSchema): unknown {
    if (++this.depth > this.maxDepth) {
      throw new Error('Max depth exceeded');
    }
    try {
      return super.decode(data, schema);
    } finally {
      this.depth--;
    }
  }
}
```

## Common Patterns

### Enum Pattern

```typescript
const ColorEnum = {
  type: 'enum',
  values: {
    RED: 0,
    GREEN: 1,
    BLUE: 2,
  },
} as const;

encoder.writeEnum('RED', ColorEnum);
const color = decoder.readEnum(ColorEnum); // 'RED' | 0
```

### Struct Pattern

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

const UserSchema = {
  type: 'struct',
  fields: [
    [{type: 'int'}, 'id'],
    [{type: 'string', size: 100}, 'name'],
    [{type: 'string', size: 255}, 'email'],
    [{type: 'boolean'}, 'active'],
  ],
} as const;
```

### Variable-Length Array Pattern

```typescript
const ListSchema = {
  type: 'varray',
  elements: {type: 'int'},
  size: 1000, // max 1000 elements
};

encoder.encode([1, 2, 3, 4, 5], ListSchema);
```

## Performance Tips

1. **Reuse encoder/decoder instances** - avoid creating new ones per operation
2. **Use fixed-size types** when possible - faster than variable-length
3. **Preallocate buffers** for known sizes
4. **Batch operations** - encode multiple values before flushing
5. **Use schema validation** only in development/testing

## Interoperability

This implementation is wire-compatible with:

- Sun RPC (ONC RPC)
- NFS (Network File System)
- Other RFC 4506-compliant libraries in any language

## Further Reading

- [SECURITY.md](./SECURITY.md) - Security considerations and best practices
- [RFC_COMPLIANCE.md](./RFC_COMPLIANCE.md) - Detailed RFC compliance information
- [CHANGELOG.md](./CHANGELOG.md) - Recent changes and additions
- [RFC 4506](https://datatracker.ietf.org/doc/html/rfc4506) - Current XDR standard
