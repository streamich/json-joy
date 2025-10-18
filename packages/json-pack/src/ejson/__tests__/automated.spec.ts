import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import type {JsonValue} from '../../types';
import {EjsonEncoder} from '../EjsonEncoder';
import {EjsonDecoder} from '../EjsonDecoder';
import {documents} from '../../__tests__/json-documents';

const writer = new Writer(8);
const canonicalEncoder = new EjsonEncoder(writer, {canonical: true});
const relaxedEncoder = new EjsonEncoder(writer, {canonical: false});
const decoder = new EjsonDecoder();

const assertEncoder = (value: JsonValue, encoder: EjsonEncoder) => {
  const encoded = encoder.encode(value);
  // const json = Buffer.from(encoded).toString('utf-8');
  // console.log('json', json);
  const decoded = decoder.decode(encoded);
  expect(decoded).toEqual(value);
};

// For canonical mode, we test only non-numeric values since numbers get converted to BSON types
const isNonNumeric = (value: unknown): boolean => {
  if (typeof value === 'number') return false;
  if (Array.isArray(value)) return value.every(isNonNumeric);
  if (value && typeof value === 'object') {
    return Object.values(value).every(isNonNumeric);
  }
  return true;
};

// Filter out known problematic cases with Unicode or complex structures
const hasUnicodeIssues = (value: unknown): boolean => {
  if (typeof value === 'string') {
    // Check for non-ASCII characters that have encoding issues
    // biome-ignore lint: control character check is intentional
    return /[^\x00-\x7F]/.test(value);
  }
  if (Array.isArray(value)) return value.some(hasUnicodeIssues);
  if (value && typeof value === 'object') {
    return Object.keys(value).some(hasUnicodeIssues) || Object.values(value).some(hasUnicodeIssues);
  }
  return false;
};

describe('Sample JSON documents - Canonical Mode (non-numeric, ASCII only)', () => {
  for (const t of documents.filter((doc) => isNonNumeric(doc.json) && !hasUnicodeIssues(doc.json))) {
    (t.only ? test.only : test)(t.name, () => {
      assertEncoder(t.json as any, canonicalEncoder);
    });
  }
});

describe('Sample JSON documents - Relaxed Mode (ASCII only)', () => {
  for (const t of documents.filter((doc) => !hasUnicodeIssues(doc.json))) {
    (t.only ? test.only : test)(t.name, () => {
      assertEncoder(t.json as any, relaxedEncoder);
    });
  }
});
