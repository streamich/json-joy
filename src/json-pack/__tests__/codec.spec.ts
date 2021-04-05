import {JsonPackExtension} from '../JsonPackExtension';
import {Encoder, Decoder} from '..';

const encoder = new Encoder();
const decoder = new Decoder();
const encode = (x: unknown) => encoder.encode(x);
const decode = (x: Uint8Array) => decoder.decode(x);

const tests: Array<{name: string, json: unknown}> = [
  {
    name: 'simple document',
    json: {
      name: 'Senior Pomidor',
      age: 12,
      keywords: ['tomato man'],
    },
  },
  {
    name: 'small int',
    json: 123,
  },
  {
    name: 'byte',
    json: 222,
  },
  {
    name: 'two byte int',
    json: 1024,
  },
  {
    name: 'four byte word',
    json: 0xFAFAFAFA,
  },
  {
    name: 'eight byte word',
    json: 0x74747474239,
  },
  {
    name: 'small negative integer',
    json: -15,
  },
  {
    name: 'small negative integer (-1)',
    json: -1,
  },
  {
    name: 'small negative integer (-2)',
    json: -2,
  },
  {
    name: 'small negative integer (-3)',
    json: -3,
  },
  {
    name: 'small negative integer (-4)',
    json: -4,
  },
  {
    name: 'small negative integer (-15)',
    json: -15,
  },
  {
    name: 'small negative integer (-16)',
    json: -16,
  },
  {
    name: 'small negative char',
    json: -100,
  },
  {
    name: 'small negative char - 2',
    json: -55,
  },
  {
    name: 'small negative char at boundary',
    json: -127,
  },
  {
    name: 'small negative char at boundary - 2',
    json: -128,
  },
  {
    name: 'negative two byte word',
    json: -0x0FCD,
  },
  {
    name: 'negative four byte word',
    json: -0x0FCDAA,
  },
  {
    name: 'negative six byte word',
    json: -0xAABBCCDDEE,
  },
  {
    name: 'float32',
    json: 1.5,
  },
  {
    name: 'float64',
    json: 1.1,
  },
  {
    name: 'empty string',
    json: '',
  },
  {
    name: 'supports umlauts',
    json: 'äbc',
  },
  {
    name: 'supports emojis',
    json: '👨‍👩‍👦‍👦',
  },
  {
    name: 'empty string in array',
    json: [''],
  },
  {
    name: 'empty string in object',
    json: {foo: ''},
  },
  {
    name: 'simple string',
    json: 'hello world',
  },
  {
    name: 'empty array',
    json: [],
  },
  {
    name: 'empty object',
    json: {},
  },
  {
    name: 'simple object',
    json: {
      foo: 'bar',
      baz: ['qux'],
    },
  },
  {
    name: 'blog post',
    json: {
      id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      author: {
        name: 'John',
        handle: '@johny',
      },
      lastSeen: -12345,
      tags: [null, 'Sports', 'Personal', 'Travel'],
      pins: [{
        id: 1239494
      }],
      marks: [
        {
          x: 1,
          y: 1.234545,
          w: 0.23494,
          h: 0,
        }
      ],
      hasRetweets: false,
      approved: true,
      likes: 33,
    },
  },
  {
    name: 'user object',
    json: {
      "title": "Person",
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string"
        },
        "lastName": {
          "type": "string"
        },
        "age": {
          "description": "Age in years",
          "type": "integer",
          "minimum": 0
        }
      },
      "required": ["firstName", "lastName"]
    },
  },
  {
    name: 'completion response',
    json: {
      "done": false,
      "text": "do something"
    },
  },
  {
    name: 'cooking receipt',
    json: {
      "id": "0001",
      "type": "donut",
      "name": "Cake",
      "ppu": 0.55,
      "batters":
        {
          "batter":
            [
              { "id": "1001", "type": "Regular" },
              { "id": "1002", "type": "Chocolate" },
              { "id": "1003", "type": "Blueberry" },
              { "id": "1004", "type": "Devil's Food" }
            ]
        },
      "topping":
        [
          { "id": "5001", "type": "None" },
          { "id": "5002", "type": "Glazed" },
          { "id": "5005", "type": "Sugar" },
          { "id": "5007", "type": "Powdered Sugar" },
          { "id": "5006", "type": "Chocolate with Sprinkles" },
          { "id": "5003", "type": "Chocolate" },
          { "id": "5004", "type": "Maple" }
        ]
    },
  },
  {
    name: 'JSON-LD object',
    json: {
      "@context": {
        "@version": 1.1,
        "schema": "http://schema.org/",
        "name": "schema:name",
        "body": "schema:articleBody",
        "words": "schema:wordCount",
        "post": {
          "@id": "schema:blogPost",
          "@container": "@id"
        },
        "none": "@none"
      },
      "@id": "http://example.com/",
      "@type": "schema:Blog",
      "name": "World Financial News",
      "post": {
        "http://example.com/posts/1/en": {
          "body": "World commodities were up today with heavy trading of crude oil...",
          "words": 1539
        },
        "http://example.com/posts/1/de": {
          "body": "Die Werte an Warenbörsen stiegen im Sog eines starken Handels von Rohöl...",
          "words": 1204
        },
        "none": {
          "body": "Description for object within an @id",
          "words": 20
        }
      }
    },
  },
  {
    name: 'JSON-LD object - 2',
    json: {
      "@context": {
        "@version": 1.1,
        "generatedAt": {
          "@id": "http://www.w3.org/ns/prov#generatedAtTime",
          "@type": "http://www.w3.org/2001/XMLSchema#date"
        },
        "Person": "http://xmlns.com/foaf/0.1/Person",
        "name": "http://xmlns.com/foaf/0.1/name",
        "knows": "http://xmlns.com/foaf/0.1/knows",
        "graphMap": {
          "@id": "http://example.org/graphMap",
          "@container": ["@graph", "@id"]
        }
      },
      "@id": "_:graph",
      "generatedAt": "2012-04-09",
      "graphMap": {
        "_:manu": {
          "@id": "http://manu.sporny.org/about#manu",
          "@type": "Person",
          "name": "Manu Sporny",
          "knows": "http://greggkellogg.net/foaf#me"
        },
        "_:gregg": {
          "@id": "http://greggkellogg.net/foaf#me",
          "@type": "Person",
          "name": "Gregg Kellogg",
          "knows": "http://manu.sporny.org/about#manu"
        }
      }
    },
  },
  {
    name: 'various types',
    json: {
      "int0": 0,
      "int1": 1,
      "int1-": -1,
      "int8": 255,
      "int8-": -255,
      "int16": 256,
      "int16-": -256,
      "int32": 65536,
      "int32-": -65536,
      "nil": null,
      "true": true,
      "false": false,
      "float": 0.5,
      "float-": -0.5,
      "string0": "",
      "string1": "A",
      "string4": "foobarbaz",
      "string8": "Omnes viae Romam ducunt.",
      "string16": "L’homme n’est qu’un roseau, le plus faible de la nature ; mais c’est un roseau pensant. Il ne faut pas que l’univers entier s’arme pour l’écraser : une vapeur, une goutte d’eau, suffit pour le tuer. Mais, quand l’univers l’écraserait, l’homme serait encore plus noble que ce qui le tue, puisqu’il sait qu’il meurt, et l’avantage que l’univers a sur lui, l’univers n’en sait rien. Toute notre dignité consiste donc en la pensée. C’est de là qu’il faut nous relever et non de l’espace et de la durée, que nous ne saurions remplir. Travaillons donc à bien penser : voilà le principe de la morale.",
      "array0": [],
      "array1": [
        "foo"
      ],
      "array8": [
        1,
        2,
        4,
        8,
        16,
        32,
        64,
        128,
        256,
        512,
        1024,
        2048,
        4096,
        8192,
        16384,
        32768,
        65536,
        131072,
        262144,
        524288,
        1048576
      ],
      "map0": {},
      "map1": {
        "foo": "bar"
      }
    },
  },
  {
    name: 'JSON-RPC request',
    json: {"version": "1.1", "method": "confirmFruitPurchase", "params": [["apple", "orange", "mangoes"], 1.123], "id": "194521489"},
  },
  /*
  {
    name: 'simple ArrayBuffer',
    json: new Uint8Array([1, 2, 3]).buffer,
  },
  {
    name: 'empty ArrayBuffer',
    json: new Uint8Array([]).buffer,
  },
  {
    name: '255 byte ArrayBuffer',
    json: new Uint8Array(255).buffer,
  },
  {
    name: '256 byte ArrayBuffer',
    json: new Uint8Array(256).buffer,
  },
  {
    name: '0xFFFF byte ArrayBuffer',
    json: new Uint8Array(0xFFFF).buffer,
  },
  {
    name: '0xFFFF + 1 byte ArrayBuffer',
    json: new Uint8Array(0xFFFF + 1).buffer,
  },
  {
    name: '1 byte extension',
    json: new JsonPackExtension(1, new Uint8Array([1]).buffer),
  },
  {
    name: '2 byte extension',
    json: new JsonPackExtension(1, new Uint8Array([1, 1]).buffer),
  },
  {
    name: '4 byte extension',
    json: new JsonPackExtension(6, new Uint8Array([1, 1, 2, 5]).buffer),
  },
  {
    name: '8 byte extension',
    json: new JsonPackExtension(213, new Uint8Array([1, 1, 2, 5, 0, 0, 3, 3]).buffer),
  },
  {
    name: '16 byte extension',
    json: new JsonPackExtension(0, new Uint8Array([1, 1, 2, 5, 0, 0, 3, 3, 1, 1, 1, 1, 2, 2, 2, 2]).buffer),
  },
  {
    name: '10 byte extension',
    json: new JsonPackExtension(10, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]).buffer),
  },
  {
    name: '255 byte extension',
    json: new JsonPackExtension(10, new Uint8Array(255).buffer),
  },
  {
    name: '256 byte extension',
    json: new JsonPackExtension(11, new Uint8Array(256).buffer),
  },
  {
    name: '0xFFFF byte extension',
    json: new JsonPackExtension(12, new Uint8Array(0xFFFF).buffer),
  },
  {
    name: '0xFFFF + 1 byte extension',
    json: new JsonPackExtension(12, new Uint8Array(0xFFFF + 1).buffer),
  },
  {
    name: '0xFFFFF byte extension',
    json: new JsonPackExtension(12, new Uint8Array(0xFFFFF).buffer),
  },
  */
];

for (const t of tests) { 
  test(t.name, () => {
    const buf = encode(t.json);
    const res = decode(buf);
    expect(res).toEqual(t.json);
  });
}
