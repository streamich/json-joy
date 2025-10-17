import {JsonPackExtension, JsonPackValue} from '@jsonjoy.com/json-pack/lib/msgpack';
import {encodeFull} from '@jsonjoy.com/json-pack/lib/msgpack/util';

export interface JsonDocument {
  name: string;
  json: unknown;
  only?: true;
}

export const msgPackDocuments: JsonDocument[] = [
  {
    name: 'MessagePack value {foo: "bar"}',
    json: new JsonPackValue(encodeFull({foo: 'bar'})),
  },
  {
    name: 'MessagePack value null',
    json: new JsonPackValue(encodeFull(null)),
  },
  {
    name: 'MessagePack value in object',
    json: {
      foo: new JsonPackValue(encodeFull(null)),
    },
  },
  {
    name: 'MessagePack value in array',
    json: [new JsonPackValue(encodeFull(null))],
  },
  {
    name: 'MessagePack extension',
    json: new JsonPackExtension(1, new Uint8Array([1, 2, 3])),
  },
  {
    name: 'MessagePack extension in object',
    json: {
      foo: new JsonPackExtension(1, new Uint8Array([1, 2, 3])),
    },
  },
  {
    name: 'MessagePack extension in array',
    json: [new JsonPackExtension(1, new Uint8Array([1, 2, 3]))],
  },
  {
    name: 'MessasgePack complex document with extensions and values',
    json: {
      foo: new JsonPackValue(encodeFull(null)),
      bar: new JsonPackExtension(1, new Uint8Array([1, 2, 3])),
      baz: new JsonPackExtension(1, new Uint8Array([1, 2, 3])),
      arr: [
        new JsonPackValue(encodeFull(null)),
        new JsonPackExtension(1, new Uint8Array([1, 2, 3])),
        new Uint8Array([1, 2, 3, 7]),
      ],
      f: false,
      n: null,
      t: true,
      _n: 123,
      s: 'sssss',
    },
  },
];
