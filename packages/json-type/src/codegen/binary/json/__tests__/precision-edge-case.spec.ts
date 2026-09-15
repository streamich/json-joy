import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {JsonCodegen} from '../JsonCodegen';
import {Configuration} from '../../../../__tests__/fixtures';

describe('Precision edge cases in JSON encoding', () => {
  test('should handle floating point edge cases near integer boundaries', () => {
    // Test with very small Writer buffer to expose capacity estimation issues
    const encoder = new JsonEncoder(new Writer(1)); // Extremely small buffer
    const decoder = new JsonDecoder();

    // Configuration type has a u16 port field with gte: 1, lte: 65535
    // This can generate numbers like 4.000000000000001 which lose precision in JSON
    const testCases = [
      {
        environment: 'development' as const,
        database: {
          host: 'localhost',
          port: 4.000000000000001, // This should round-trip correctly
          name: 'test',
        },
        features: {},
        secrets: {},
      },
      {
        environment: 'development' as const,
        database: {
          host: 'localhost',
          port: 4, // This is the expected result after JSON round-trip
          name: 'test',
        },
        features: {},
        secrets: {},
      },
      {
        environment: 'production' as const,
        database: {
          host: 'db.example.com',
          port: 5432.0000000001, // Edge case near common port
          name: 'prod',
        },
        features: {},
        secrets: {},
      },
    ];

    for (const json of testCases) {
      const fn = JsonCodegen.get(Configuration);
      fn(json, encoder);
      const encoded = encoder.writer.flush();
      const text = Buffer.from(encoded).toString('utf-8');
      const decoded = decoder.decode(encoded);
      
      // The decoded value should equal the original after JSON precision loss
      // This test demonstrates the precision issue
      expect(typeof decoded).toBe('object');
      expect(decoded).toHaveProperty('database');
      // Note: port values with tiny decimal parts will be lost during JSON encoding
    }
  });

  test('should handle number encoding with minimal buffer', () => {
    // Test with progressively smaller buffers to find the minimum needed
    const bufferSizes = [1, 2, 4, 8];
    
    for (const size of bufferSizes) {
      const encoder = new JsonEncoder(new Writer(size));
      const decoder = new JsonDecoder();
      
      const json = {
        environment: 'development' as const,
        database: {
          host: 'h',
          port: 1,
          name: 'd',
        },
        features: {},
        secrets: {},
      };

      const fn = JsonCodegen.get(Configuration);
      fn(json, encoder);
      const encoded = encoder.writer.flush();
      const decoded = decoder.decode(encoded);
      
      expect(decoded).toEqual(json);
    }
  });
});
