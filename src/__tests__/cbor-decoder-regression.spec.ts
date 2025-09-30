/**
 * Regression test for CBOR decoder issue #925
 * 
 * This test ensures that the CborDecoder can be instantiated and used correctly.
 * It specifically tests for the "keyDecoder is undefined" issue that occurs when
 * @jsonjoy.com/util uses problematic re-exports.
 * 
 * Issue: https://github.com/streamich/json-joy/issues/925
 * Root cause: tslib.__exportStar skips the default export when re-exporting modules
 */

import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';

// Import the runtime patch to apply it for all tests in this file
import '../util/cbor-decoder-fix';

describe('CBOR decoder regression tests', () => {
  describe('issue #925: keyDecoder undefined', () => {
    it('should have keyDecoder defined after runtime patch is applied', () => {
      const decoder = new CborDecoder();
      
      // After the runtime patch, keyDecoder should be properly defined
      expect(decoder.keyDecoder).toBeDefined();
      expect(typeof decoder.keyDecoder).toBe('object');
      expect(decoder.keyDecoder).not.toBeNull();
    });

    it('should encode and decode data correctly with patched decoder', () => {
      const encoder = new CborEncoder();
      const decoder = new CborDecoder();
      
      const testData = {
        hello: 'world',
        number: 42,
        nested: {
          array: [1, 2, 3],
          boolean: true
        }
      };
      
      const encoded = encoder.encode(testData);
      expect(encoded).toBeInstanceOf(Uint8Array);
      
      const decoded = decoder.decode(encoded);
      expect(decoded).toEqual(testData);
    });

    it('should handle string keys correctly (keyDecoder functionality)', () => {
      const encoder = new CborEncoder();
      const decoder = new CborDecoder();
      
      // Test data with various string keys to ensure keyDecoder works
      const testData = {
        'short': 'value',
        'longer_key_name': 'another_value',
        'key_with_unicode_💀': 'emoji_value',
        'key-with-dashes': 'dash_value'
      };
      
      const encoded = encoder.encode(testData);
      const decoded = decoder.decode(encoded);
      
      expect(decoded).toEqual(testData);
      
      // Verify all keys are properly decoded
      expect(Object.keys(decoded as object)).toEqual(Object.keys(testData));
    });

    it('should work with complex nested objects with string keys', () => {
      const encoder = new CborEncoder();
      const decoder = new CborDecoder();
      
      const testData = {
        'user_profile': {
          'first_name': 'John',
          'last_name': 'Doe',
          'preferences': {
            'theme': 'dark',
            'notifications_enabled': true,
            'languages': ['en', 'es', 'fr']
          }
        },
        'metadata': {
          'created_at': '2023-01-01',
          'version': 1
        }
      };
      
      const encoded = encoder.encode(testData);
      const decoded = decoder.decode(encoded);
      
      expect(decoded).toEqual(testData);
    });
  });
});