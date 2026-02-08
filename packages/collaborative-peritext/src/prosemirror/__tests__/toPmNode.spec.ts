import { ToPmNode } from '../toPmNode';
import { ModelWithExt, ext } from 'json-joy/lib/json-crdt-extensions';
import { FromPm } from '../FromPm';
import { PmJsonNode } from '../types';
import { Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-test-builder';
import { addListNodes } from 'prosemirror-schema-list';
import * as fixtures from './fixtures';

const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

const assertConversion = (json: PmJsonNode) => {
  const model = ModelWithExt.create(ext.peritext.new(''));
  const viewRange = FromPm.convert(mySchema.nodeFromJSON(json));
  const txt = model.s.toExt().txt;
  txt.editor.merge(viewRange);
  txt.refresh();
  const toPm = new ToPmNode(mySchema);
  const pmNode = toPm.convert(txt.blocks);
  expect(pmNode.toJSON()).toEqual(json);
};

test('a simple single-paragraph document', () => {
  const json: PmJsonNode = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello, ProseMirror!' }],
      },
    ],
  };
  assertConversion(json);
});

test('a simple single-paragraph document with inline mark', () => {
  const json: PmJsonNode = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Hello, ProseMirror!', marks: [{ type: 'strong' }] },
        ],
      },
    ],
  };
  assertConversion(json);
});


test('block with attributes', () => {
  const json: PmJsonNode = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        content: [{ type: 'text', text: 'Hello, ProseMirror!' }],
        attrs: {
          level: 2,
        },
      },
    ],
  };
  assertConversion(json);
});

test('a small two-paragraph document', () => {
  const json: PmJsonNode = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello, ProseMirror!' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'This is a basic ' },
          {
            type: 'text',
            text: 'rich text',
            marks: [{ type: 'em' }, { type: 'strong' }],
          },
          { type: 'text', text: ' editor.' },
        ],
      },
    ],
  };
  assertConversion(json);
});

describe('fixtures', () => {
  for (const [name, fixture] of Object.entries(fixtures)) {
    test(name, () => {
      assertConversion(fixture.toJSON());
    });
  }
});
