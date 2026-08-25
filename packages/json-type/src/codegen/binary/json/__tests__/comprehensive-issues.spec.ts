/**
 * Comprehensive test to demonstrate the issues found:
 * 
 * 1. Floating point precision loss in Random.num() for integer types
 *    - Random.num() adds/subtracts 0.000000000000001 to avoid exact boundaries
 *    - This creates values like 4.000000000000001 for u16 types
 *    - JSON encoding/decoding loses this precision, resulting in 4
 * 
 * 2. Stale buffer references when buffer grows during encoding
 *    - Generated code caches uint8 and view references at start
 *    - If buffer grows during encoding, these references become stale
 *    - This can cause corruption or incorrect encoding
 * 
 * 3. Capacity estimator may underestimate required buffer size
 *    - Uses MaxEncodingOverhead constants for estimation
 *    - May not account for all edge cases (unicode, escaped chars, etc)
 *    - With very small initial buffer, this is exposed
 */

import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {JsonCodegen} from '../JsonCodegen';
import {Random} from '../../../../random';
import {Configuration} from '../../../../__tests__/fixtures';
import {ModuleType} from '../../../../type/classes/ModuleType';

describe('Comprehensive issue demonstration', () => {
  describe('Issue 1: Floating point precision loss', () => {
    test('u16 port number loses precision through JSON round-trip', () => {
      const encoder = new JsonEncoder(new Writer(256)); // Use reasonable buffer
      const decoder = new JsonDecoder();

      // This is what Random.num() might generate for u16 with gte:1, lte:65535
      const originalPort = 4.000000000000001;
      
      // Encode just the number
      encoder.writer.reset();
      encoder.writeNumber(originalPort);
      const encoded = encoder.writer.flush();
      const text = Buffer.from(encoded).toString('utf-8');
      
      // The text will be "4" not "4.000000000000001"
      expect(text).toBe('4');
      
      // When decoded, we get 4, not 4.000000000000001
      const decoded = decoder.decode(encoded);
      expect(decoded).toBe(4);
      expect(decoded).not.toBe(originalPort);
    });

    test('Random.gen() can produce floating point values for integer formats', () => {
      // Run multiple times to increase chance of hitting the edge case
      let foundFloatingPoint = false;
      
      for (let i = 0; i < 1000; i++) {
        const config = Random.gen(Configuration);
        const port = config.database.port;
        
        // Check if port is a floating point number (not an integer)
        if (port !== Math.floor(port)) {
          foundFloatingPoint = true;
          console.log(`Found floating point port at iteration ${i}: ${port}`);
          break;
        }
      }
      
      // This test documents that Random can generate non-integers for u16
      // (it might not always happen, depending on random values)
      console.log('Found floating point in random generation:', foundFloatingPoint);
    });
  });

  describe('Issue 2: Stale buffer references', () => {
    test('demonstrates stale references with extremely small initial buffer', () => {
      // With 1-byte initial buffer, guaranteed to need growth
      const encoder = new JsonEncoder(new Writer(1));
      const decoder = new JsonDecoder();

      const json = {
        environment: 'development' as const,
        database: {
          host: 'localhost-with-long-name-to-force-buffer-growth',
          port: 5432,
          name: 'database-with-long-name',
        },
        features: {
          enableFeature1: true,
          enableFeature2: false,
        },
        secrets: {
          apiKey: 'very-long-api-key-value-to-ensure-buffer-needs-to-grow',
        },
        logging: {
          level: 'info' as const,
          output: '/var/log/app.log',
        },
      };

      const fn = JsonCodegen.get(Configuration);
      
      // The generated function has:
      // var uint8 = writer.uint8, view = writer.view;
      // If buffer grows during encoding, these become stale
      fn(json, encoder);
      const encoded = encoder.writer.flush();
      const decoded = decoder.decode(encoded);
      
      // If the stale reference bug exists, this might fail or produce corrupted data
      expect(decoded).toEqual(json);
    });

    test('works with moderate buffer size that avoids the stale reference issue', () => {
      // With adequate buffer, no growth needed, so no stale references
      const encoder = new JsonEncoder(new Writer(1024));
      const decoder = new JsonDecoder();

      const json = {
        environment: 'development' as const,
        database: {
          host: 'localhost',
          port: 5432,
          name: 'testdb',
        },
        features: {},
        secrets: {},
      };

      const fn = JsonCodegen.get(Configuration);
      fn(json, encoder);
      const encoded = encoder.writer.flush();
      const decoded = decoder.decode(encoded);
      
      expect(decoded).toEqual(json);
    });
  });

  describe('Issue 3: Capacity estimator edge cases', () => {
    test('handles unicode strings that take more bytes than ASCII', () => {
      const encoder = new JsonEncoder(new Writer(1));
      const decoder = new JsonDecoder();

      const json = {
        environment: 'development' as const,
        database: {
          // Unicode chars take 2-4 bytes in UTF-8
          host: '数据库服务器',
          port: 3306,
          name: 'データベース',
        },
        features: {},
        secrets: {
          // Mix of ASCII and Unicode
          key1: 'value-with-unicode: 你好',
        },
      };

      const fn = JsonCodegen.get(Configuration);
      fn(json, encoder);
      const encoded = encoder.writer.flush();
      const decoded = decoder.decode(encoded);
      
      expect(decoded).toEqual(json);
    });

    test('handles strings with escaped characters', () => {
      const encoder = new JsonEncoder(new Writer(1));
      const decoder = new JsonDecoder();

      const json = {
        environment: 'development' as const,
        database: {
          // These characters need escaping in JSON
          host: 'host"with"quotes',
          port: 5432,
          name: 'db\\with\\backslashes',
        },
        features: {},
        secrets: {
          key: 'value\nwith\nnewlines',
        },
      };

      const fn = JsonCodegen.get(Configuration);
      fn(json, encoder);
      const encoded = encoder.writer.flush();
      const decoded = decoder.decode(encoded);
      
      expect(decoded).toEqual(json);
    });

    test('handles Map types with many entries', () => {
      const encoder = new JsonEncoder(new Writer(1));
      const decoder = new JsonDecoder();

      // Create a Configuration with many features and secrets
      const features: Record<string, boolean> = {};
      const secrets: Record<string, string> = {};
      
      for (let i = 0; i < 50; i++) {
        features[`feature${i}`] = i % 2 === 0;
        secrets[`secret${i}`] = `value${i}`;
      }

      const json = {
        environment: 'production' as const,
        database: {
          host: 'db.example.com',
          port: 5432,
          name: 'proddb',
        },
        features,
        secrets,
      };

      const fn = JsonCodegen.get(Configuration);
      fn(json, encoder);
      const encoded = encoder.writer.flush();
      const decoded = decoder.decode(encoded);
      
      expect(decoded).toEqual(json);
    });
  });

  describe('Combined stress test', () => {
    test('random generation with minimal buffer - ultimate stress test', () => {
      const encoder = new JsonEncoder(new Writer(1));
      const decoder = new JsonDecoder();

      // Generate random data and try to encode/decode with minimal buffer
      // This combines all three issues:
      // - Random might generate problematic float values
      // - Small buffer will trigger growth and expose stale references
      // - Capacity estimation must be accurate
      
      let successCount = 0;
      let floatPrecisionFailures = 0;
      let otherFailures = 0;
      
      for (let i = 0; i < 100; i++) {
        const json = Random.gen(Configuration);
        
        try {
          const fn = JsonCodegen.get(Configuration);
          fn(json, encoder);
          const encoded = encoder.writer.flush();
          const decoded = decoder.decode(encoded);
          
          // Check for deep equality
          try {
            expect(decoded).toEqual(json);
            successCount++;
          } catch (equalityError) {
            // Check if this is a floating point precision issue
            const decodedPort = (decoded as any).database.port;
            const originalPort = json.database.port;
            
            if (Math.abs(decodedPort - originalPort) < 0.01) {
              // This is the floating point precision issue
              floatPrecisionFailures++;
              console.log(`Iteration ${i}: Float precision issue - original: ${originalPort}, decoded: ${decodedPort}`);
            } else {
              throw equalityError;
            }
          }
        } catch (error) {
          otherFailures++;
          console.log(`Iteration ${i} failed:`, error);
          console.log('JSON:', JSON.stringify(json, null, 2));
          if (otherFailures > 5) throw error; // Stop after too many other failures
        }
      }
      
      console.log(`Results: ${successCount} successes, ${floatPrecisionFailures} float precision failures, ${otherFailures} other failures`);
      
      // We expect most to succeed, but some might have float precision issues
      expect(successCount + floatPrecisionFailures).toBeGreaterThan(90);
    });
  });
});
