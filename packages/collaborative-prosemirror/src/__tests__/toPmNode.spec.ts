import {ToPmNode} from '../sync/toPmNode';
import {ModelWithExt, ext, CommonSliceType} from 'json-joy/lib/json-crdt-extensions';
import {FromPm} from '../sync/FromPm';
import {PmJsonNode} from '../types';
import {Schema} from 'prosemirror-model';
import {schema} from 'prosemirror-test-builder';
import {addListNodes} from 'prosemirror-schema-list';
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

  // Check first level on nodes is cached
  const pmNode2 = toPm.convert(txt.blocks);
  for (let i = 0; i < pmNode.content.content.length; i++) {
    const child1 = pmNode.content.child(i);
    const child2 = pmNode2.content.child(i);
    expect(child1).toBe(child2);
  }
};

test('a simple single-paragraph document', () => {
  const json: PmJsonNode = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{type: 'text', text: 'Hello, ProseMirror!'}],
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
        content: [{type: 'text', text: 'Hello, ProseMirror!', marks: [{type: 'strong'}]}],
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
        content: [{type: 'text', text: 'Hello, ProseMirror!'}],
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
        content: [{type: 'text', text: 'Hello, ProseMirror!'}],
      },
      {
        type: 'paragraph',
        content: [
          {type: 'text', text: 'This is a basic '},
          {
            type: 'text',
            text: 'rich text',
            marks: [{type: 'em'}, {type: 'strong'}],
          },
          {type: 'text', text: ' editor.'},
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

describe('cache behavior', () => {
  const setup = (json: PmJsonNode) => {
    const model = ModelWithExt.create(ext.peritext.new(''));
    const viewRange = FromPm.convert(mySchema.nodeFromJSON(json));
    const txt = model.s.toExt().txt;
    txt.editor.merge(viewRange);
    txt.refresh();
    const toPm = new ToPmNode(mySchema);
    return {model, txt, toPm};
  };

  const twoParagraphDoc: PmJsonNode = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{type: 'text', text: 'First paragraph.'}],
      },
      {
        type: 'paragraph',
        content: [{type: 'text', text: 'Second paragraph.'}],
      },
    ],
  };

  test('inserting text into one paragraph busts its cache but not the other', () => {
    const {txt, toPm} = setup(twoParagraphDoc);
    const pm1 = toPm.convert(txt.blocks);
    expect(pm1.toJSON()).toEqual(twoParagraphDoc);
    txt.insAt(1, 'Hello ');
    txt.refresh();
    const pm2 = toPm.convert(txt.blocks);

    // First paragraph changed - different node instance
    expect(pm2.content.child(0)).not.toBe(pm1.content.child(0));
    expect(pm2.content.child(0).textContent).toBe('Hello First paragraph.');

    // Second paragraph unchanged - same node instance (cache hit)
    expect(pm2.content.child(1)).toBe(pm1.content.child(1));
    expect(pm2.content.child(1).textContent).toBe('Second paragraph.');
  });

  test('inserting text into the second paragraph busts only its cache', () => {
    const {txt, toPm} = setup(twoParagraphDoc);
    const pm1 = toPm.convert(txt.blocks);
    const secondParaTextStart = 1 + 'First paragraph.'.length + 1;
    txt.insAt(secondParaTextStart, 'INSERTED ');
    txt.refresh();
    const pm2 = toPm.convert(txt.blocks);

    // First paragraph unchanged - cache hit
    expect(pm2.content.child(0)).toBe(pm1.content.child(0));

    // Second paragraph changed - cache miss
    expect(pm2.content.child(1)).not.toBe(pm1.content.child(1));
    expect(pm2.content.child(1).textContent).toContain('INSERTED');
  });

  test('adding an inline mark busts the affected paragraph cache', () => {
    const {txt, toPm} = setup(twoParagraphDoc);
    const pm1 = toPm.convert(txt.blocks);
    const range = txt.rangeAt(1, 5);
    txt.editor.saved.insStack(CommonSliceType.strong, undefined, [range]);
    txt.refresh();
    const pm2 = toPm.convert(txt.blocks);

    // First paragraph changed (now has bold marks)
    expect(pm2.content.child(0)).not.toBe(pm1.content.child(0));

    // Second paragraph unchanged
    expect(pm2.content.child(1)).toBe(pm1.content.child(1));
  });

  test('splitting a paragraph busts cache and produces more children', () => {
    const initialDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{type: 'text', text: 'Hello world.'}],
        },
        {
          type: 'paragraph',
          content: [{type: 'text', text: 'Another paragraph.'}],
        },
      ],
    };
    const {txt, toPm} = setup(initialDoc);
    const pm1 = toPm.convert(txt.blocks);
    txt.editor.cursor.setAt(6);
    txt.editor.saved.insMarker('paragraph', undefined);
    txt.editor.delCursors();
    txt.refresh();
    const pm2 = toPm.convert(txt.blocks);
    expect(pm1.content.childCount).toBe(2);
    expect(pm2.content.childCount).toBe(3);
    expect(pm2.content.child(0).textContent).toBe('Hello');
    expect(pm2.content.child(1).textContent).toBe(' world.');

    expect(pm2.content.child(0)).not.toBe(pm1.content.child(0));
    expect(pm2.content.child(1)).not.toBe(pm1.content.child(0));
    expect(pm2.content.child(2)).toBe(pm1.content.child(1)); // second paragraph unchanged, cache hit
  });

  test('no mutation at all - all children are cache hits', () => {
    const {txt, toPm} = setup(twoParagraphDoc);
    const pm1 = toPm.convert(txt.blocks);
    txt.refresh();
    const pm2 = toPm.convert(txt.blocks);
    txt.refresh();
    const pm3 = toPm.convert(txt.blocks);
    for (let i = 0; i < pm1.content.childCount; i++) {
      expect(pm2.content.child(i)).toBe(pm1.content.child(i));
      expect(pm3.content.child(i)).toBe(pm1.content.child(i));
    }
  });

  test('cache survives one idle render cycle (double-buffer GC)', () => {
    const {txt, toPm} = setup(twoParagraphDoc);
    const pm1 = toPm.convert(txt.blocks);
    txt.refresh();
    const pm2 = toPm.convert(txt.blocks);
    txt.refresh();
    const pm3 = toPm.convert(txt.blocks);
    for (let i = 0; i < pm1.content.childCount; i++) {
      expect(pm3.content.child(i)).toBe(pm1.content.child(i));
    }
  });

  test('deleting text busts only the affected paragraph cache', () => {
    const {txt, toPm} = setup(twoParagraphDoc);
    const pm1 = toPm.convert(txt.blocks);
    txt.editor.cursor.setAt(1, 6);
    txt.editor.del(1);
    txt.refresh();
    const pm2 = toPm.convert(txt.blocks);
    expect(pm2.content.child(0)).not.toBe(pm1.content.child(0));
    expect(pm2.content.child(0).textContent).toBe('paragraph.');
    expect(pm2.content.child(1)).toBe(pm1.content.child(1));
  });

  test('multiple sequential mutations bust only affected paragraphs', () => {
    const threeParaDoc: PmJsonNode = {
      type: 'doc',
      content: [
        {type: 'paragraph', content: [{type: 'text', text: 'AAA'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'BBB'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'CCC'}]},
      ],
    };
    const {txt, toPm} = setup(threeParaDoc);
    const pm1 = toPm.convert(txt.blocks);
    txt.insAt(1, 'X');
    txt.refresh();
    const pm2 = toPm.convert(txt.blocks);
    expect(pm2.content.child(0)).not.toBe(pm1.content.child(0)); // changed
    expect(pm2.content.child(1)).toBe(pm1.content.child(1)); // cached
    expect(pm2.content.child(2)).toBe(pm1.content.child(2)); // cached
    txt.insAt(10, 'Y');
    txt.refresh();
    const pm3 = toPm.convert(txt.blocks);
    expect(pm3.content.child(0)).toBe(pm2.content.child(0)); // cached from pm2
    expect(pm3.content.child(1)).toBe(pm2.content.child(1)); // still cached from pm1
    expect(pm3.content.child(2)).not.toBe(pm2.content.child(2)); // changed

    expect(pm3.content.child(0)).not.toBe(pm1.content.child(0));
    expect(pm3.content.child(1)).toBe(pm2.content.child(1));
    expect(pm3.content.child(2)).not.toBe(pm2.content.child(2));
  });
});
