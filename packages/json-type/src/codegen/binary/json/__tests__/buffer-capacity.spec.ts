import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {JsonCodegen} from '../JsonCodegen';
import {Random} from '../../../../random';
import {Configuration} from '../../../../__tests__/fixtures';

describe('Buffer capacity estimation stress tests', () => {
  test('should handle Configuration encoding with very small initial buffer', () => {
    // Use extremely small buffer to force many reallocations
    // This will expose bugs in capacity estimation
    const encoder = new JsonEncoder(new Writer(1));
    const decoder = new JsonDecoder();

    // Run multiple iterations to increase chance of hitting edge cases
    for (let i = 0; i < 1000; i++) {
      const json = Random.gen(Configuration);
      
      try {
        const fn = JsonCodegen.get(Configuration);
        fn(json, encoder);
        const encoded = encoder.writer.flush();
        const decoded = decoder.decode(encoded);
        
        // The test should pass, but might fail due to precision issues
        // or buffer estimation bugs
        expect(decoded).toEqual(json);
      } catch (error) {
        console.log('Failed at iteration', i);
        console.log('Generated JSON:', JSON.stringify(json, null, 2));
        throw error;
      }
    }
  });

  test('should expose floating point precision issues in u16 port numbers', () => {
    const encoder = new JsonEncoder(new Writer(1));
    const decoder = new JsonDecoder();

    // Manually create a case that's likely to trigger the precision issue
    // When port has a tiny decimal part, JSON encoding/decoding will lose it
    const problematicJson = {
      environment: 'development' as const,
      database: {
        host: 'localhost',
        port: 4.000000000000001, // This will become 4 after JSON round-trip
        name: 'testdb',
      },
      features: {},
      secrets: {},
    };

    const fn = JsonCodegen.get(Configuration);
    fn(problematicJson, encoder);
    const encoded = encoder.writer.flush();
    const text = Buffer.from(encoded).toString('utf-8');
    const decoded = decoder.decode(encoded);

    // Log the actual values to see the precision loss
    console.log('Original port:', problematicJson.database.port);
    console.log('Encoded text:', text);
    console.log('Decoded port:', (decoded as any).database.port);
    
    // This will fail because 4.000000000000001 !== 4 after JSON round-trip
    // This demonstrates the precision issue
    expect(decoded).toEqual(problematicJson);
  });

  test('should test all buffer sizes from 1 to 128', () => {
    const decoder = new JsonDecoder();

    // Test with various small buffer sizes to find which ones work
    for (let bufferSize = 1; bufferSize <= 128; bufferSize *= 2) {
      const encoder = new JsonEncoder(new Writer(bufferSize));
      
      const json = {
        environment: 'production' as const,
        database: {
          host: 'db.example.com',
          port: 5432,
          name: 'production_db',
        },
        features: {
          feature1: true,
          feature2: false,
          feature3: true,
        },
        secrets: {
          secret1: 'value1',
          secret2: 'value2',
        },
        logging: {
          level: 'info' as const,
          output: '/var/log/app.log',
        },
      };

      const fn = JsonCodegen.get(Configuration);
      fn(json, encoder);
      const encoded = encoder.writer.flush();
      const decoded = decoder.decode(encoded);
      
      expect(decoded).toEqual(json);
    }
  });
});
