import {CborEncoder} from '../CborEncoder';
import {CborDecoder} from '../CborDecoder';

const encoder = new CborEncoder();
const decoder = new CborDecoder();

test('value is too short, buffer too long', () => {
  const encoded = encoder.encode(1.1);
  decoder.validate(encoded);
  const corrupted = new Uint8Array(encoded.length + 1);
  corrupted.set(encoded);
  expect(() => decoder.validate(corrupted)).toThrow();
});

test('value is truncated, buffer too short', () => {
  const encoded = encoder.encode(1.1);
  decoder.validate(encoded);
  const corrupted = encoded.subarray(0, encoded.length - 1);
  expect(() => decoder.validate(corrupted)).toThrow();
});

test('validates valid indefinite map', () => {
  encoder.writer.reset();
  encoder.writeStartMap();
  encoder.writeStr('foo');
  encoder.writeStr('bar');
  encoder.writeEnd();
  const encoded = encoder.writer.flush();
  decoder.validate(encoded);
});

test('value contents is corrupted, break between map key and value', () => {
  encoder.writer.reset();
  encoder.writeStartMap();
  encoder.writeStr('foo');
  encoder.writeEnd();
  encoder.writeStr('bar');
  encoder.writeEnd();
  const encoded = encoder.writer.flush();
  expect(() => decoder.validate(encoded)).toThrow();
});

test('value contents is corrupted, no value in indefinite map', () => {
  encoder.writer.reset();
  encoder.writeStartMap();
  encoder.writeStr('foo');
  encoder.writeEnd();
  const encoded = encoder.writer.flush();
  expect(() => decoder.validate(encoded)).toThrow();
});

test('invalid value', () => {
  const encoded = new Uint8Array([0xff]);
  expect(() => decoder.validate(encoded)).toThrow();
});
