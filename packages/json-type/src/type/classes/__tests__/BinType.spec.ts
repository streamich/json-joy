import {t} from '../../..';

test('can use convenience methods to define type schema fields', () => {
  const binary = t.bin;
  expect(binary.getSchema()).toEqual({kind: 'bin', type: {kind: 'any'}});
  binary.title('My Binary');
  expect(binary.getSchema()).toEqual({kind: 'bin', type: {kind: 'any'}, title: 'My Binary'});
  binary.intro('This is a binary type');
  expect(binary.getSchema()).toEqual({
    kind: 'bin',
    type: {kind: 'any'},
    title: 'My Binary',
    intro: 'This is a binary type',
  });
  binary.description('A detailed description of the binary type');
  expect(binary.getSchema()).toEqual({
    kind: 'bin',
    type: {kind: 'any'},
    title: 'My Binary',
    intro: 'This is a binary type',
    description: 'A detailed description of the binary type',
  });
  binary.format('json');
  expect(binary.getSchema()).toEqual({
    kind: 'bin',
    type: {kind: 'any'},
    title: 'My Binary',
    intro: 'This is a binary type',
    description: 'A detailed description of the binary type',
    format: 'json',
  });
  binary.min(5);
  expect(binary.getSchema()).toEqual({
    kind: 'bin',
    type: {kind: 'any'},
    title: 'My Binary',
    intro: 'This is a binary type',
    description: 'A detailed description of the binary type',
    format: 'json',
    min: 5,
  });
  binary.max(10);
  expect(binary.getSchema()).toEqual({
    kind: 'bin',
    type: {kind: 'any'},
    title: 'My Binary',
    intro: 'This is a binary type',
    description: 'A detailed description of the binary type',
    format: 'json',
    min: 5,
    max: 10,
  });
  binary.default(new Uint8Array([1, 2, 3]));
  expect(binary.getSchema()).toEqual({
    kind: 'bin',
    type: {kind: 'any'},
    title: 'My Binary',
    intro: 'This is a binary type',
    description: 'A detailed description of the binary type',
    format: 'json',
    min: 5,
    max: 10,
    default: new Uint8Array([1, 2, 3]),
  });
  binary.example(new Uint8Array([4, 5, 6]), 'Example Binary', {description: 'An example binary value'});
  expect(binary.getSchema()).toEqual({
    kind: 'bin',
    type: {kind: 'any'},
    title: 'My Binary',
    intro: 'This is a binary type',
    description: 'A detailed description of the binary type',
    format: 'json',
    min: 5,
    max: 10,
    default: new Uint8Array([1, 2, 3]),
    examples: [{value: new Uint8Array([4, 5, 6]), title: 'Example Binary', description: 'An example binary value'}],
  });
});
