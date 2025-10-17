# `json-random`

A fast, flexible random JSON generation library with zero dependencies. Generate random JSON data for testing, development, and prototyping with powerful template-based schemas or simple randomization.

## Features

- **Fast & Lightweight**: Zero dependencies, optimized for performance
- **Template-Based Generation**: Create structured JSON following schemas
- **Flexible Randomization**: Control probabilities, types, and structure
- **Deterministic Mode**: Reproducible random generation with seeds
- **String Token System**: Powerful pattern-based string generation
- **TypeScript Support**: Full type definitions included

## Installation

```bash
npm install @jsonjoy.com/json-random
```

## Quick Start

```typescript
import { RandomJson, TemplateJson, randomString, deterministic } from '@jsonjoy.com/json-random';

// Generate random JSON
const randomData = RandomJson.generate();

// Generate structured JSON from template
const userData = TemplateJson.gen(['obj', [
  ['id', ['int', 1, 1000]],
  ['name', ['str', ['list', ['pick', 'John', 'Jane', 'Bob'], ' ', ['pick', 'Doe', 'Smith']]]],
  ['active', 'bool']
]]);

// Generate random strings with patterns
const email = randomString(['list', 
  ['pick', 'user', 'admin', 'test'], 
  '@', 
  ['pick', 'example.com', 'test.org']
]);
```

## API Reference

### RandomJson

The `RandomJson` class provides methods for generating random JSON data with configurable options.

#### `RandomJson.generate(options?: RandomJsonOptions): unknown`

Generates a random JSON object with the specified options.

```typescript
interface RandomJsonOptions {
  rootNode?: 'object' | 'array' | 'string';
  nodeCount?: number;
  odds?: NodeOdds;
  strings?: Token;
}

interface NodeOdds {
  null: number;
  boolean: number;
  number: number;
  string: number;
  binary: number;
  array: number;
  object: number;
}
```

**Examples:**

```typescript
// Basic random JSON (default: object with ~32 nodes)
const basic = RandomJson.generate();

// Smaller JSON with 5 nodes
const small = RandomJson.generate({ nodeCount: 5 });

// Force root to be an array
const arrayRoot = RandomJson.generate({ 
  rootNode: 'array',
  nodeCount: 3 
});

// Customize node type probabilities
const stringHeavy = RandomJson.generate({
  nodeCount: 10,
  odds: {
    null: 1,
    boolean: 1,
    number: 2,
    string: 20,    // Much higher probability for strings
    binary: 0,
    array: 2,
    object: 5
  }
});

// Use custom string patterns
const customStrings = RandomJson.generate({
  nodeCount: 5,
  strings: ['pick', 'alpha', 'beta', 'gamma', 'delta']
});
```

#### Static Generation Methods

Generate specific JSON types directly:

```typescript
// Generate random string (default length: 1-16 chars)
const str = RandomJson.genString();
const longStr = RandomJson.genString(50);

// Generate random number
const num = RandomJson.genNumber();

// Generate random boolean
const bool = RandomJson.genBoolean();

// Generate random array
const arr = RandomJson.genArray();
const customArr = RandomJson.genArray({
  nodeCount: 3,
  odds: { string: 10, number: 5, boolean: 1, null: 0, array: 0, object: 0, binary: 0 }
});

// Generate random object
const obj = RandomJson.genObject();
const customObj = RandomJson.genObject({
  nodeCount: 4,
  odds: { string: 8, number: 8, boolean: 2, null: 1, array: 1, object: 1, binary: 0 }
});

// Generate random binary data
const binary = RandomJson.genBinary();
const largeBinary = RandomJson.genBinary(100);
```

### TemplateJson

The `TemplateJson` class generates JSON data following structured templates, perfect for creating realistic test data.

#### `TemplateJson.gen(template?: Template, opts?: TemplateJsonOpts): unknown`

Generates JSON following the specified template.

```typescript
interface TemplateJsonOpts {
  maxNodes?: number; // Soft limit on total nodes generated (default: 100)
}
```

#### Template Types

Templates define the structure and type of generated data:

##### Basic Types

```typescript
// Shorthand templates
TemplateJson.gen('str');    // Random string
TemplateJson.gen('int');    // Random integer
TemplateJson.gen('int64');  // Random 64-bit integer (bigint)
TemplateJson.gen('float');  // Random float
TemplateJson.gen('num');    // Random number (int or float)
TemplateJson.gen('bool');   // Random boolean
TemplateJson.gen('bin');    // Random binary data (Uint8Array)
TemplateJson.gen('nil');    // null value

// Type-specific templates
TemplateJson.gen(['str', tokenPattern]);           // String with pattern
TemplateJson.gen(['int', min, max]);              // Integer in range
TemplateJson.gen(['int64', min, max]);            // 64-bit integer in range (bigint)
TemplateJson.gen(['float', min, max]);            // Float in range
TemplateJson.gen(['bool', fixedValue]);           // Fixed or random boolean
TemplateJson.gen(['bin', min, max, omin, omax]);  // Binary with length and octet range
TemplateJson.gen(['lit', anyValue]);              // Literal value (cloned)
```

**Examples:**

```typescript
// Strings with patterns
const greeting = TemplateJson.gen(['str', ['list', 
  ['pick', 'Hello', 'Hi', 'Hey'], 
  ' ', 
  ['pick', 'World', 'There']
]]);

// Numbers in ranges
const age = TemplateJson.gen(['int', 18, 100]);
const price = TemplateJson.gen(['float', 0.01, 999.99]);
const score = TemplateJson.gen(['num', 0, 100]);

// 64-bit integers (bigint)
const largeId = TemplateJson.gen(['int64', BigInt('1000000000000'), BigInt('9999999999999')]);
const timestamp = TemplateJson.gen(['int64', BigInt('1640000000000'), BigInt('1700000000000')]);

// Binary data (Uint8Array)
const hash = TemplateJson.gen(['bin', 32, 32]); // 32-byte hash
const key = TemplateJson.gen(['bin', 16, 16, 0, 255]); // 16-byte key with full octet range
const randomBytes = TemplateJson.gen(['bin', 1, 10]); // 1-10 random bytes

// Fixed values
const isActive = TemplateJson.gen(['bool', true]);
const userId = TemplateJson.gen(['lit', 'user_12345']);
```

##### 64-bit Integer Templates

Generate large integers using JavaScript's bigint type:

```typescript
// Basic 64-bit integer
const id = TemplateJson.gen('int64');                // Random bigint in safe range

// 64-bit integer with range
const timestamp = TemplateJson.gen(['int64', 
  BigInt('1640000000000'),  // Min value
  BigInt('1700000000000')   // Max value
]);

// Large database IDs
const dbId = TemplateJson.gen(['int64', 
  BigInt('1000000000000000000'), 
  BigInt('9999999999999999999')
]);

// Fixed bigint value
const constant = TemplateJson.gen(['int64', BigInt('42'), BigInt('42')]);
```

##### Binary Data Templates

Generate binary data as Uint8Array:

```typescript
// Basic binary data (0-5 bytes)
const data = TemplateJson.gen('bin');

// Binary with specific length range
const hash = TemplateJson.gen(['bin', 32, 32]);     // Exactly 32 bytes
const key = TemplateJson.gen(['bin', 16, 64]);      // 16-64 bytes

// Binary with octet value constraints
const restrictedData = TemplateJson.gen(['bin', 
  8,    // Min length: 8 bytes
  16,   // Max length: 16 bytes  
  32,   // Min octet value: 32
  126   // Max octet value: 126 (printable ASCII range)
]);

// Cryptographic examples
const aesKey = TemplateJson.gen(['bin', 32, 32]);           // 256-bit AES key
const iv = TemplateJson.gen(['bin', 16, 16]);               // 128-bit IV
const salt = TemplateJson.gen(['bin', 16, 32]);             // 16-32 byte salt
const signature = TemplateJson.gen(['bin', 64, 64, 0, 255]); // 64-byte signature
```

##### Array Templates

```typescript
type ArrayTemplate = [
  'arr',
  min?,        // Minimum length (default: 0)
  max?,        // Maximum length (default: 5)  
  template?,   // Template for items
  head?,       // Fixed items at start
  tail?        // Fixed items at end
];
```

**Examples:**

```typescript
// Basic arrays
const numbers = TemplateJson.gen(['arr', 2, 5, 'int']);
const mixed = TemplateJson.gen(['arr', 1, 3]);

// Arrays with head/tail
const coords = TemplateJson.gen(['arr', 0, 0, null, 
  [['float', -180, 180], ['float', -90, 90]], // head: [longitude, latitude]
  [['lit', 'WGS84']]                          // tail: coordinate system
]);

// Nested arrays
const matrix = TemplateJson.gen(['arr', 2, 3, 
  ['arr', 2, 3, ['int', 0, 10]]
]);
```

##### Object Templates

```typescript
type ObjectTemplate = [
  'obj',
  fields?  // Array of field definitions
];

type ObjectTemplateField = [
  key,           // Key name (string or Token)
  valueTemplate, // Template for the value
  optionality?   // Probability of omission (0 = required, 1 = always omit)
];
```

**Examples:**

```typescript
// User profile
const user = TemplateJson.gen(['obj', [
  ['id', ['int', 1, 10000]],
  ['username', ['str', ['list', 
    ['pick', 'user', 'admin', 'guest'], 
    ['char', 48, 57, 4] // 4 digits
  ]]],
  ['email', ['str', ['list',
    ['repeat', 3, 10, ['char', 97, 122]], // 3-10 lowercase letters
    '@',
    ['pick', 'example.com', 'test.org', 'demo.net']
  ]]],
  ['age', ['int', 18, 120]],
  ['isActive', 'bool'],
  ['profile', ['obj', [
    ['bio', ['str', ['repeat', 10, 50, ['char', 32, 126]]]],
    ['avatar', ['str', ['list', 'https://avatar.example.com/', ['char', 48, 57, 8]]], 0.3]  // 30% chance to omit
  ]]]
]]);

// API Response
const apiResponse = TemplateJson.gen(['obj', [
  ['status', ['pick', 'success', 'error']],
  ['timestamp', ['int', 1640000000, 1700000000]],
  ['data', ['arr', 0, 10, ['obj', [
    ['id', 'int'],
    ['value', 'str']
  ]]]]
]]);
```

##### Map Templates

Generate key-value maps where all values follow the same template:

```typescript
type MapTemplate = [
  'map',
  keyToken?,    // Token for generating keys
  valueTemplate?, // Template for values
  min?,         // Minimum entries (default: 0)
  max?          // Maximum entries (default: 5)
];
```

**Examples:**

```typescript
// Configuration map
const config = TemplateJson.gen(['map',
  ['pick', 'timeout', 'retries', 'cache_ttl', 'max_connections'],
  ['int', 1, 3600],
  3, 5
]);

// User permissions
const permissions = TemplateJson.gen(['map',
  ['list', 'can_', ['pick', 'read', 'write', 'delete', 'admin']],
  'bool',
  2, 6
]);

// Localization strings
const translations = TemplateJson.gen(['map',
  ['pick', 'welcome', 'goodbye', 'error', 'success', 'loading'],
  ['str', ['repeat', 5, 20, ['char', 32, 126]]],
  3, 8
]);
```

##### Union Templates (Or)

Choose randomly from multiple template options:

```typescript
// Mixed data types
const mixedValue = TemplateJson.gen(['or', 'str', 'int', 'bool']);

// Different user types
const user = TemplateJson.gen(['or',
  ['obj', [['type', ['lit', 'admin']], ['permissions', ['lit', 'all']]]],
  ['obj', [['type', ['lit', 'user']], ['level', ['int', 1, 5]]]],
  ['obj', [['type', ['lit', 'guest']], ['expires', 'int']]]
]);
```

##### Recursive Templates

Create self-referencing structures:

```typescript
// Tree structure
const tree = (): Template => ['obj', [
  ['value', 'int'],
  ['left', tree, 0.3],   // 30% chance of left child
  ['right', tree, 0.3]   // 30% chance of right child
]];

const treeData = TemplateJson.gen(tree);

// Nested comments
const comment = (): Template => ['obj', [
  ['id', 'int'],
  ['text', 'str'],
  ['author', 'str'],
  ['replies', ['arr', 0, 3, comment, [], []], 0.4] // 40% chance of replies
]];

const commentThread = TemplateJson.gen(comment);
```

### String Token System

The `randomString` function and string templates use a powerful token system for pattern-based string generation.

#### `randomString(token: Token): string`

```typescript
type Token = TokenLiteral | TokenPick | TokenRepeat | TokenChar | TokenList;
```

#### Token Types

##### `TokenLiteral` - Static strings
```typescript
randomString('Hello');  // Always returns "Hello"
```

##### `TokenPick` - Choose randomly from options
```typescript
randomString(['pick', 'red', 'green', 'blue']);
// Returns one of: "red", "green", "blue"

randomString(['pick', 
  'small', 'medium', 'large', 'extra-large'
]);
```

##### `TokenRepeat` - Repeat patterns
```typescript
randomString(['repeat', 3, 5, 'X']);
// Returns 3-5 X's: "XXX", "XXXX", or "XXXXX"

randomString(['repeat', 2, 4, ['pick', 'A', 'B']]);
// Returns 2-4 random A's or B's: "AB", "BAA", "ABBA", etc.
```

##### `TokenChar` - Character ranges
```typescript
randomString(['char', 65, 90]);     // Single random A-Z
randomString(['char', 97, 122, 5]); // 5 random a-z chars
randomString(['char', 48, 57, 3]);  // 3 random digits

// Unicode ranges
randomString(['char', 0x1F600, 0x1F64F]); // Random emoji
```

##### `TokenList` - Concatenate tokens
```typescript
randomString(['list', 
  'user_',
  ['char', 48, 57, 4],              // 4 digits
  '_',
  ['pick', 'active', 'inactive']
]);
// Example: "user_1234_active"

// Email generation
randomString(['list',
  ['repeat', 3, 12, ['char', 97, 122]], // 3-12 lowercase letters
  ['pick', '.', '_', '-', ''],          // Optional separator
  ['repeat', 0, 5, ['char', 97, 122]],  // 0-5 more letters
  '@',
  ['pick', 'gmail.com', 'yahoo.com', 'example.org']
]);
```

#### Complex String Examples

```typescript
// Phone numbers
const phone = randomString(['list',
  '+1-',
  ['char', 50, 57, 3],  // Area code (2-9)
  '-',
  ['char', 48, 57, 3],  // Exchange
  '-',
  ['char', 48, 57, 4]   // Number
]);

// Product codes
const productCode = randomString(['list',
  ['pick', 'PRD', 'ITM', 'SKU'],
  '-',
  ['char', 65, 90, 2],    // 2 uppercase letters
  ['char', 48, 57, 6]     // 6 digits
]);

// URLs
const url = randomString(['list',
  'https://',
  ['repeat', 3, 15, ['char', 97, 122]], // Domain name
  ['pick', '.com', '.org', '.net', '.io'],
  ['pick', '', '/', '/api/', '/v1/'],
  ['repeat', 0, 10, ['char', 97, 122]] // Optional path
]);
```

### Utility Functions

#### `deterministic(seed: number | (() => number), callback: () => T): T`

Execute code with deterministic random number generation.

```typescript
import { deterministic, RandomJson, TemplateJson } from '@jsonjoy.com/json-random';

// Generate the same data every time
const data1 = deterministic(42, () => RandomJson.generate({ nodeCount: 5 }));
const data2 = deterministic(42, () => RandomJson.generate({ nodeCount: 5 }));
// data1 and data2 are identical

// Different seeds produce different but deterministic results
const dataA = deterministic(123, () => TemplateJson.gen('str'));
const dataB = deterministic(456, () => TemplateJson.gen('str'));

// Use custom random number generator
const customRng = rnd(999);
const data3 = deterministic(customRng, () => RandomJson.generate());
```

#### `rnd(seed: number): () => number`

Create a deterministic random number generator function.

```typescript
import { rnd } from '@jsonjoy.com/json-random';

const randomFn = rnd(12345);
console.log(randomFn()); // 0.00002...
console.log(randomFn()); // 0.77271...
console.log(randomFn()); // 0.32429...
```

#### `int(min: number, max: number): number`

Generate a random integer between min and max (inclusive).

```typescript
import { int } from '@jsonjoy.com/json-random';

const dice = int(1, 6);        // 1-6
const percentage = int(0, 100); // 0-100
const id = int(1000, 9999);   // 4-digit ID
```

## Use Cases

### Testing & Development

```typescript
// Generate test user data
const testUsers = Array.from({ length: 10 }, () => 
  TemplateJson.gen(['obj', [
    ['id', ['int', 1, 10000]],
    ['name', ['str', ['list', 
      ['pick', 'John', 'Jane', 'Bob', 'Alice', 'Charlie'],
      ' ',
      ['pick', 'Doe', 'Smith', 'Johnson', 'Brown']
    ]]],
    ['email', ['str', ['list',
      ['repeat', 3, 10, ['char', 97, 122]],
      '@test.com'
    ]]],
    ['age', ['int', 18, 65]],
    ['active', 'bool']
  ]])
);

// Generate API response mock data
const mockApiResponse = TemplateJson.gen(['obj', [
  ['success', ['lit', true]],
  ['timestamp', ['lit', Date.now()]],
  ['data', ['arr', 5, 15, ['obj', [
    ['id', 'int'],
    ['status', ['pick', 'pending', 'completed', 'failed']],
    ['value', ['float', 0, 1000]]
  ]]]]
]]);

// Generate cryptographic test data
const cryptoData = TemplateJson.gen(['obj', [
  ['userId', ['int64', BigInt('1000000000000'), BigInt('9999999999999')]],
  ['sessionId', ['str', ['list', 'sess_', ['repeat', 32, 32, ['pick', ...'0123456789abcdef'.split('')]]]]],
  ['publicKey', ['bin', 32, 32]], // 256-bit public key
  ['signature', ['bin', 64, 64]], // 512-bit signature
  ['nonce', ['bin', 16, 16]],     // 128-bit nonce
  ['timestamp', ['int64', BigInt(Date.now()), BigInt(Date.now() + 86400000)]]
]]);
```

### Load Testing

```typescript
// Generate large datasets for performance testing
const loadTestData = deterministic(42, () => 
  Array.from({ length: 1000 }, () => 
    RandomJson.generate({ 
      nodeCount: 50,
      odds: {
        null: 1,
        boolean: 2,
        number: 10,
        string: 8,
        binary: 0,
        array: 3,
        object: 5
      }
    })
  )
);
```

### Configuration Generation

```typescript
// Generate service configurations
const serviceConfig = TemplateJson.gen(['obj', [
  ['database', ['obj', [
    ['host', ['str', ['list', 'db-', ['char', 48, 57, 2], '.example.com']]],
    ['port', ['int', 3000, 6000]],
    ['timeout', ['int', 1000, 30000]],
    ['pool_size', ['int', 5, 50]]
  ]]],
  ['cache', ['obj', [
    ['enabled', 'bool'],
    ['ttl', ['int', 60, 3600]],
    ['max_size', ['int', 100, 10000]]
  ]]],
  ['security', ['obj', [
    ['api_key', ['bin', 32, 32]],                    // 256-bit API key
    ['session_timeout', ['int64', BigInt('3600'), BigInt('86400')]], // 1 hour to 1 day in seconds
    ['max_request_size', ['int64', BigInt('1048576'), BigInt('104857600')]] // 1MB to 100MB
  ]]],
  ['features', ['map',
    ['pick', 'feature_a', 'feature_b', 'feature_c', 'feature_d'],
    'bool',
    2, 5
  ]]
]]);
```

## Helper Methods for Easy Generation

The library provides convenient helper methods for generating common data types without needing to construct templates manually. These methods are available in the `examples` module:

```typescript
import { 
  genUser, 
  genAddress, 
  genProduct, 
  genOrder,
  genRandomExample 
} from '@jsonjoy.com/json-random/lib/examples';

// Generate common data types quickly
const user = genUser();
const address = genAddress();
const product = genProduct();
const order = genOrder();

// Generate random example from any template
const randomData = genRandomExample();
```

### Available Helper Methods

| Method | Description |
|--------|-------------|
| `genUser()` | Generate comprehensive user profile with details |
| `genUserBasic()` | Generate basic user with essential information |
| `genAddress()` | Generate address with street, city, state, etc. |
| `genProduct()` | Generate product with name, price, category |
| `genOrder()` | Generate order with items and customer info |
| `genTransaction()` | Generate financial transaction data |
| `genBankAccount()` | Generate bank account information |
| `genSocialPost()` | Generate social media post |
| `genSocialProfile()` | Generate social media profile |
| `genLocation()` | Generate location with coordinates |
| `genApiResponse()` | Generate API response with data array |
| `genApiResponseDetailed()` | Generate comprehensive API response |
| `genServiceConfig()` | Generate service configuration |
| `genPatient()` | Generate medical patient record |
| `genMedicalRecord()` | Generate comprehensive medical record |
| `genStudent()` | Generate student profile |
| `genCourse()` | Generate course information |
| `genSensorReading()` | Generate IoT sensor reading |
| `genIotDevice()` | Generate IoT device profile |
| `genLogEntry()` | Generate log entry for monitoring |
| `genMetricData()` | Generate metric data for monitoring |
| `genRandomExample()` | Generate random data from any available template |

### Usage Examples

```typescript
// Generate test user data for API testing
const testUser = genUser();
console.log(testUser);
// Output: { id: 4829, username: "user_7432", email: "alice@gmail.com", ... }

// Generate address for form testing
const shippingAddress = genAddress();
console.log(shippingAddress);
// Output: { street: "123 Main St", city: "Springfield", state: "CA", ... }

// Generate product catalog
const products = Array.from({ length: 10 }, () => genProduct());

// Generate random test data
const randomTestData = Array.from({ length: 5 }, () => genRandomExample());
```

## Demos

Run the included demos to see the library in action:

```bash
# Random JSON generation
npx ts-node src/__demos__/json-random.ts

# Template-based generation  
npx ts-node src/__demos__/map-demo.ts
```

## TypeScript Support

The library includes full TypeScript definitions:

```typescript
import type { 
  RandomJsonOptions, 
  NodeOdds,
  Template,
  TemplateJsonOpts,
  Token,
  ArrayTemplate,
  ObjectTemplate,
  MapTemplate
} from '@jsonjoy.com/json-random';
```

## License

Apache-2.0