import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';
import {JsonEncoder} from '@jsonjoy.com/json-pack/lib/json/JsonEncoder';
import {JsonCodegen} from '../JsonCodegen';
import {Configuration} from '../../../../__tests__/fixtures';
import {s} from '../../../../schema';
import {ModuleType} from '../../../../type/classes/ModuleType';

describe('Stale buffer reference bug', () => {
  test('should expose stale uint8/view references when buffer grows during encoding', () => {
    // Create a Writer with initial size of 1 byte - guaranteed to be too small
    const encoder = new JsonEncoder(new Writer(1));
    const decoder = new JsonDecoder();

    // Create a Configuration object with long strings to force buffer growth
    const json = {
      environment: 'development' as const,
      database: {
        host: 'this-is-a-very-long-hostname-that-will-need-more-space-than-initially-allocated',
        port: 5432,
        name: 'another-very-long-database-name-to-force-buffer-reallocation',
      },
      features: {
        feature1: true,
        feature2: false,
        feature3: true,
        feature4: false,
      },
      secrets: {
        secret1: 'value-that-is-quite-long-to-trigger-reallocation-during-encoding',
        secret2: 'another-very-long-secret-value-to-ensure-buffer-growth',
        secret3: 'yet-another-secret-with-a-long-value',
      },
      logging: {
        level: 'info' as const,
        output: '/var/log/application-logs/very-long-path-name.log',
      },
    };

    const fn = JsonCodegen.get(Configuration);
    
    // This should work, but might fail if the cached uint8/view references
    // become stale when the buffer grows during encoding
    fn(json, encoder);
    const encoded = encoder.writer.flush();
    const decoded = decoder.decode(encoded);
    
    expect(decoded).toEqual(json);
  });

  test('should handle object with many fields that exceeds initial capacity estimate', () => {
    // Create a type with many required fields
    const mod = new ModuleType();
    const ManyFields = mod.t.Object(
      mod.t.Key('field1', mod.t.str),
      mod.t.Key('field2', mod.t.str),
      mod.t.Key('field3', mod.t.str),
      mod.t.Key('field4', mod.t.str),
      mod.t.Key('field5', mod.t.str),
      mod.t.Key('field6', mod.t.str),
      mod.t.Key('field7', mod.t.str),
      mod.t.Key('field8', mod.t.str),
      mod.t.Key('field9', mod.t.str),
      mod.t.Key('field10', mod.t.str),
    );

    const encoder = new JsonEncoder(new Writer(1));
    const decoder = new JsonDecoder();

    const json = {
      field1: 'value1-with-some-extra-length',
      field2: 'value2-with-some-extra-length',
      field3: 'value3-with-some-extra-length',
      field4: 'value4-with-some-extra-length',
      field5: 'value5-with-some-extra-length',
      field6: 'value6-with-some-extra-length',
      field7: 'value7-with-some-extra-length',
      field8: 'value8-with-some-extra-length',
      field9: 'value9-with-some-extra-length',
      field10: 'value10-with-some-extra-length',
    };

    const fn = JsonCodegen.get(ManyFields);
    fn(json, encoder);
    const encoded = encoder.writer.flush();
    const decoded = decoder.decode(encoded);
    
    expect(decoded).toEqual(json);
  });

  test('should handle capacity estimation edge case with unicode strings', () => {
    // Unicode strings can be underestimated by capacity estimator
    const encoder = new JsonEncoder(new Writer(1));
    const decoder = new JsonDecoder();

    const json = {
      environment: 'development' as const,
      database: {
        host: '你好世界-こんにちは-안녕하세요-مرحبا', // Unicode strings take more bytes
        port: 3306,
        name: '数据库名称',
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
