import {VectorClock} from '../../../../json-crdt-patch/clock';
import {Document} from '../../../document';
import {Encoder} from '../Encoder';

test('encodes an empty document', () => {
  const doc = new Document(new VectorClock(123, 0));
  const encoder = new Encoder();
  const res = encoder.encode(doc);
  expect(res).toEqual( {
    clock: [ [ 123, 0 ] ],
    root: { type: 'root', id: [ 0, 0 ], node: null }
  });
});

test('encodes all JSON node types object', () => {
  const doc = new Document(new VectorClock(123, 0));
  const encoder = new Encoder();
  doc.api.root({
    str: 'bar',
    num: 123,
    bool: true,
    empty: null,
    arr: [false],
  }).commit();
  const res = encoder.encode(doc);
  expect(res).toEqual({
    "clock": [
        [
            123,
            14
        ]
    ],
    "root": {
        "type": "root",
        "id": [
            123,
            13
        ],
        "node": {
            "type": "obj",
            "id": [
                123,
                0
            ],
            "chunks": {
                "str": {
                    "id": [
                        123,
                        8
                    ],
                    "node": {
                        "type": "str",
                        "id": [
                            123,
                            1
                        ],
                        "chunks": [
                            {
                                "id": [
                                    123,
                                    2
                                ],
                                "value": "bar"
                            }
                        ]
                    }
                },
                "num": {
                    "id": [
                        123,
                        9
                    ],
                    "node": {
                        "type": "val",
                        "id": [
                            123,
                            5
                        ],
                        "value": 123
                    }
                },
                "bool": {
                    "id": [
                        123,
                        10
                    ],
                    "node": {
                        "type": "const",
                        "value": true
                    }
                },
                "empty": {
                    "id": [
                        123,
                        11
                    ],
                    "node": {
                        "type": "const",
                        "value": null
                    }
                },
                "arr": {
                    "id": [
                        123,
                        12
                    ],
                    "node": {
                        "type": "arr",
                        "id": [
                            123,
                            6
                        ],
                        "chunks": [
                            {
                                "id": [
                                    123,
                                    7
                                ],
                                "nodes": [
                                    {
                                        "type": "const",
                                        "value": false
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        }
    }
  });
});

test('encodes deleted string chunks', () => {
  const doc = new Document(new VectorClock(123, 0));
  const encoder = new Encoder();
  doc.api.root('abc').commit();
  doc.api.strDel([], 1, 1).commit();
  const res = encoder.encode(doc);
  expect(res).toEqual({
    "clock": [
        [
            123,
            6
        ]
    ],
    "root": {
        "type": "root",
        "id": [
            123,
            4
        ],
        "node": {
            "type": "str",
            "id": [
                123,
                0
            ],
            "chunks": [
                {
                    "id": [
                        123,
                        1
                    ],
                    "value": "a"
                },
                {
                    "id": [
                        123,
                        2
                    ],
                    "span": 1
                },
                {
                    "id": [
                        123,
                        3
                    ],
                    "value": "c"
                }
            ]
        }
    }
  });
});
