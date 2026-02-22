import {SlateFuzzer} from './tools/fuzzer';
import {assertRoundtripForTraceCheckpoints} from './tools/assertions';
import type {SlateTrace} from './tools/traces';

test('run random fuzzer trace through roundtrip', () => {
  for (let i = 0; i < 10; i++) {
    const seed: number = Math.floor(Math.random() * 1000000);
    const trace = SlateFuzzer.genTrace(seed);
    try {
      assertRoundtripForTraceCheckpoints(trace);
    } catch (error) {
      console.error(`Fuzzer seed causing failure: ${seed}`);
      console.log(JSON.stringify(trace));
      throw error;
    }
  }
});

describe('fuzzer issues', () => {
  test('seed: 595060', () => {
    const trace: SlateTrace = {
      start: [{type: 'paragraph', children: [{text: ''}]}],
      operations: [
        {
          type: 'set_selection',
          properties: null,
          newProperties: {
            anchor: {path: [0, 0], offset: 0},
            focus: {path: [0, 0], offset: 0},
          },
        },
        {
          type: 'set_node',
          path: [0],
          properties: {type: 'paragraph'},
          newProperties: {type: 'list-item'},
        },
        {
          type: 'insert_node',
          path: [0, 1],
          node: {text: 'zzi', code: true, bold: true},
        },
        {
          type: 'set_selection',
          properties: {
            anchor: {path: [0, 0], offset: 0},
            focus: {path: [0, 0], offset: 0},
          },
          newProperties: {
            anchor: {path: [0, 1], offset: 3},
            focus: {path: [0, 1], offset: 3},
          },
        },
        {type: 'remove_node', path: [0, 0], node: {text: ''}},
        {
          type: 'set_selection',
          properties: {
            anchor: {path: [0, 0], offset: 3},
            focus: {path: [0, 0], offset: 3},
          },
          newProperties: {
            anchor: {path: [0, 0], offset: 1},
            focus: {path: [0, 0], offset: 0},
          },
        },
        {type: 'remove_text', path: [0, 0], offset: 0, text: 'z'},
        {type: 'insert_text', path: [0, 0], offset: 0, text: 'vf'},
        {
          type: 'set_selection',
          properties: {focus: {path: [0, 0], offset: 2}},
          newProperties: {focus: {path: [0, 0], offset: 0}},
        },
        {
          type: 'set_node',
          path: [0],
          properties: {type: 'list-item'},
          newProperties: {type: 'h1'},
        },
        {
          type: 'set_selection',
          properties: {anchor: {path: [0, 0], offset: 2}},
          newProperties: {anchor: {path: [0, 0], offset: 0}},
        },
        {type: 'remove_text', path: [0, 0], offset: 0, text: 'v'},
        {
          type: 'set_selection',
          properties: {
            anchor: {path: [0, 0], offset: 0},
            focus: {path: [0, 0], offset: 0},
          },
          newProperties: {
            anchor: {path: [0, 0], offset: 1},
            focus: {path: [0, 0], offset: 1},
          },
        },
        {
          type: 'split_node',
          path: [0, 0],
          position: 1,
          properties: {code: true, bold: true},
        },
        {
          type: 'split_node',
          path: [0],
          position: 1,
          properties: {type: 'h1'},
        },
        {
          type: 'set_selection',
          properties: {
            anchor: {path: [1, 0], offset: 0},
            focus: {path: [1, 0], offset: 0},
          },
          newProperties: {
            anchor: {path: [1, 0], offset: 1},
            focus: {path: [0, 0], offset: 1},
          },
        },
        {
          type: 'set_node',
          path: [0],
          properties: {type: 'h1'},
          newProperties: {type: 'bulleted-list'},
        },
        {
          type: 'set_node',
          path: [1],
          properties: {type: 'h1'},
          newProperties: {type: 'bulleted-list'},
        },
        {
          type: 'set_selection',
          properties: {
            anchor: {path: [1, 0], offset: 1},
            focus: {path: [0, 0], offset: 1},
          },
          newProperties: {
            anchor: {path: [0, 0], offset: 0},
            focus: {path: [0, 0], offset: 0},
          },
        },
        {type: 'remove_text', path: [0, 0], offset: 0, text: 'f'},
        {
          type: 'set_selection',
          properties: {
            anchor: {path: [0, 0], offset: 0},
            focus: {path: [0, 0], offset: 0},
          },
          newProperties: {
            anchor: {path: [1, 0], offset: 0},
            focus: {path: [1, 0], offset: 0},
          },
        },
        {type: 'insert_text', path: [1, 0], offset: 0, text: 'lqn'},
        {
          type: 'set_selection',
          properties: {
            anchor: {path: [1, 0], offset: 3},
            focus: {path: [1, 0], offset: 3},
          },
          newProperties: {
            anchor: {path: [1, 0], offset: 5},
            focus: {path: [1, 0], offset: 1},
          },
        },
        {type: 'remove_text', path: [1, 0], offset: 1, text: 'qnzi'},
        {
          type: 'set_selection',
          properties: {anchor: {path: [1, 0], offset: 1}},
          newProperties: {anchor: {path: [1, 0], offset: 0}},
        },
        {type: 'remove_text', path: [1, 0], offset: 0, text: 'l'},
        {type: 'insert_text', path: [1, 0], offset: 0, text: 'ifhcz'},
        {
          type: 'set_selection',
          properties: {
            anchor: {path: [1, 0], offset: 5},
            focus: {path: [1, 0], offset: 5},
          },
          newProperties: {
            anchor: {path: [0, 0], offset: 0},
            focus: {path: [0, 0], offset: 0},
          },
        },
        {
          type: 'remove_node',
          path: [0],
          node: {
            type: 'bulleted-list',
            children: [{text: '', code: true, bold: true}],
          },
        },
        {
          type: 'set_selection',
          properties: {
            anchor: {path: [0, 0], offset: 0},
            focus: {path: [0, 0], offset: 0},
          },
          newProperties: {
            anchor: {path: [0, 0], offset: 2},
            focus: {path: [0, 0], offset: 2},
          },
        },
        {
          type: 'set_selection',
          properties: {
            anchor: {path: [0, 0], offset: 2},
            focus: {path: [0, 0], offset: 2},
          },
          newProperties: {
            anchor: {path: [0, 0], offset: 3},
            focus: {path: [0, 0], offset: 5},
          },
        },
        {type: 'remove_text', path: [0, 0], offset: 3, text: 'cz'},
        {
          type: 'set_selection',
          properties: {
            anchor: {path: [0, 0], offset: 3},
            focus: {path: [0, 0], offset: 3},
          },
          newProperties: {
            anchor: {path: [0, 0], offset: 0},
            focus: {path: [0, 0], offset: 0},
          },
        },
        {type: 'insert_text', path: [0, 0], offset: 0, text: 'kr'},
      ],
      checkpoints: [2, 5, 8, 10, 12, 15, 18, 20, 22, 24, 27, 29, 32, 34],
    };
    assertRoundtripForTraceCheckpoints(trace);
  });
});
