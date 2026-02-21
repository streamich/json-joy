/** @jest-environment jsdom */

import {Node} from 'prosemirror-model';
import {EditorState} from 'prosemirror-state';
import {schema, doc, p, blockquote, ul, ol, li, h1, h2, h3, em, strong, a, pre} from 'prosemirror-test-builder';
import {applyPatch} from '../sync/applyPatch';
import {NodeToViewRangeFuzzer} from './fuzzer';
import * as fixtures from './fixtures';

const assertPatch = (oldDoc: Node, newDoc: Node) => {
  const state = EditorState.create({doc: oldDoc, schema});
  const tr = state.tr;
  applyPatch(tr, state.doc, newDoc);
  expect(tr.doc.toJSON()).toEqual(newDoc.toJSON());
};

describe('applyPatch', () => {
  describe('identical documents produce no steps', () => {
    test('single paragraph', () => {
      const d = doc(p('hello')) as Node;
      const state = EditorState.create({doc: d, schema});
      const tr = state.tr;
      applyPatch(tr, state.doc, d);
      expect(tr.steps.length).toBe(0);
    });

    test('complex document', () => {
      const d = fixtures.realisticDoc as Node;
      const state = EditorState.create({doc: d, schema});
      const tr = state.tr;
      applyPatch(tr, state.doc, d);
      expect(tr.steps.length).toBe(0);
    });
  });

  describe('text changes within a single paragraph', () => {
    test('append text', () => {
      assertPatch(doc(p('hello')) as Node, doc(p('hello world')) as Node);
    });

    test('prepend text', () => {
      assertPatch(doc(p('world')) as Node, doc(p('hello world')) as Node);
    });

    test('delete text', () => {
      assertPatch(doc(p('hello world')) as Node, doc(p('hello')) as Node);
    });

    test('replace text', () => {
      assertPatch(doc(p('hello world')) as Node, doc(p('hello earth')) as Node);
    });

    test('empty paragraph to text', () => {
      assertPatch(doc(p()) as Node, doc(p('abc')) as Node);
    });

    test('text to empty paragraph', () => {
      assertPatch(doc(p('abc')) as Node, doc(p()) as Node);
    });
  });

  describe('inline mark changes', () => {
    test('add emphasis', () => {
      assertPatch(doc(p('hello world')) as Node, doc(p('hello ', em('world'))) as Node);
    });

    test('remove emphasis', () => {
      assertPatch(doc(p('hello ', em('world'))) as Node, doc(p('hello world')) as Node);
    });

    test('change mark type', () => {
      assertPatch(doc(p(em('hello'))) as Node, doc(p(strong('hello'))) as Node);
    });

    test('nested marks', () => {
      assertPatch(doc(p('plain')) as Node, doc(p(em(strong('bold-italic')))) as Node);
    });
  });

  describe('block-level structural changes', () => {
    test('add a paragraph', () => {
      assertPatch(doc(p('one')) as Node, doc(p('one'), p('two')) as Node);
    });

    test('remove a paragraph', () => {
      assertPatch(doc(p('one'), p('two')) as Node, doc(p('one')) as Node);
    });

    test('swap two paragraphs', () => {
      assertPatch(doc(p('first'), p('second')) as Node, doc(p('second'), p('first')) as Node);
    });

    test('change block type', () => {
      assertPatch(doc(p('heading')) as Node, doc(h1('heading')) as Node);
    });

    test('paragraph to blockquote', () => {
      assertPatch(doc(p('quoted')) as Node, doc(blockquote(p('quoted'))) as Node);
    });

    test('insert paragraph in the middle', () => {
      assertPatch(doc(p('one'), p('three')) as Node, doc(p('one'), p('two'), p('three')) as Node);
    });

    test('delete paragraph from the middle', () => {
      assertPatch(doc(p('one'), p('two'), p('three')) as Node, doc(p('one'), p('three')) as Node);
    });
  });

  describe('nested list changes', () => {
    test('add list item', () => {
      assertPatch(doc(ul(li(p('a')), li(p('b')))) as Node, doc(ul(li(p('a')), li(p('b')), li(p('c')))) as Node);
    });

    test('remove list item', () => {
      assertPatch(doc(ul(li(p('a')), li(p('b')), li(p('c')))) as Node, doc(ul(li(p('a')), li(p('c')))) as Node);
    });

    test('edit text in nested list', () => {
      assertPatch(doc(ul(li(p('first')), li(p('second')))) as Node, doc(ul(li(p('first')), li(p('SECOND')))) as Node);
    });

    test('unordered to ordered list', () => {
      assertPatch(doc(ul(li(p('a')), li(p('b')))) as Node, doc(ol(li(p('a')), li(p('b')))) as Node);
    });
  });

  describe('heading level changes', () => {
    test('h1 to h2', () => {
      assertPatch(doc(h1('Title')) as Node, doc(h2('Title')) as Node);
    });

    test('h2 to h3 with text change', () => {
      assertPatch(doc(h2('Old Title')) as Node, doc(h3('New Title')) as Node);
    });
  });

  describe('whole document replacement', () => {
    test('completely different documents', () => {
      assertPatch(doc(p('old content')) as Node, doc(h1('New'), p('Different doc'), blockquote(p('Quoted'))) as Node);
    });

    test('empty to complex', () => {
      assertPatch(doc(p()) as Node, fixtures.realisticDoc as Node);
    });

    test('complex to empty', () => {
      assertPatch(fixtures.realisticDoc as Node, doc(p()) as Node);
    });
  });

  describe('fixture-to-fixture conversions', () => {
    const fixtureEntries = Object.entries(fixtures).filter(
      ([, val]) => val && typeof val === 'object' && 'type' in val,
    ) as [string, Node][];

    for (const [nameA, docA] of fixtureEntries) {
      for (const [nameB, docB] of fixtureEntries) {
        test(`${nameA} - ${nameB}`, () => {
          assertPatch(docA, docB);
        });
      }
    }
  });

  describe('step minimality', () => {
    test('single character change produces exactly one step', () => {
      const old = doc(p('abcdef')) as Node;
      const nw = doc(p('abcXef')) as Node;
      const state = EditorState.create({doc: old, schema});
      const tr = state.tr;
      applyPatch(tr, state.doc, nw);
      expect(tr.doc.toJSON()).toEqual(nw.toJSON());
      expect(tr.steps.length).toBe(1);
    });

    test('change in last of three paragraphs produces one step', () => {
      const old = doc(p('one'), p('two'), p('three')) as Node;
      const nw = doc(p('one'), p('two'), p('THREE')) as Node;
      const state = EditorState.create({doc: old, schema});
      const tr = state.tr;
      applyPatch(tr, state.doc, nw);
      expect(tr.doc.toJSON()).toEqual(nw.toJSON());
      expect(tr.steps.length).toBe(1);
    });

    test('change in first of three paragraphs produces one step', () => {
      const old = doc(p('one'), p('two'), p('three')) as Node;
      const nw = doc(p('ONE'), p('two'), p('three')) as Node;
      const state = EditorState.create({doc: old, schema});
      const tr = state.tr;
      applyPatch(tr, state.doc, nw);
      expect(tr.doc.toJSON()).toEqual(nw.toJSON());
      expect(tr.steps.length).toBe(1);
    });

    test('identical docs produce zero steps', () => {
      const d = doc(p('hello'), h1('world')) as Node;
      const state = EditorState.create({doc: d, schema});
      const tr = state.tr;
      applyPatch(tr, state.doc, d);
      expect(tr.steps.length).toBe(0);
    });
  });

  test('fuzz: random doc - random doc', () => {
    for (let i = 0; i < 100; i++) {
      const oldDoc = NodeToViewRangeFuzzer.doc() as Node;
      const newDoc = NodeToViewRangeFuzzer.doc() as Node;
      assertPatch(oldDoc, newDoc);
    }
  });

  describe('fuzz: random doc - fixture', () => {
    const fixtureEntries = Object.entries(fixtures).filter(
      ([, val]) => val && typeof val === 'object' && 'type' in val,
    ) as [string, Node][];

    for (const [name, fixtureDoc] of fixtureEntries) {
      for (let i = 0; i < 5; i++) {
        test(`random - ${name} (${i})`, () => {
          const oldDoc = NodeToViewRangeFuzzer.doc() as Node;
          assertPatch(oldDoc, fixtureDoc);
        });
      }
    }
  });

  describe('fuzz: fixture - random doc', () => {
    const fixtureEntries = Object.entries(fixtures).filter(
      ([, val]) => val && typeof val === 'object' && 'type' in val,
    ) as [string, Node][];

    for (const [name, fixtureDoc] of fixtureEntries) {
      for (let i = 0; i < 5; i++) {
        test(`${name} - random (${i})`, () => {
          const newDoc = NodeToViewRangeFuzzer.doc() as Node;
          assertPatch(fixtureDoc, newDoc);
        });
      }
    }
  });
});
