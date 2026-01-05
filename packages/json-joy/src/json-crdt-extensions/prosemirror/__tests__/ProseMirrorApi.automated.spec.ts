import {Node} from 'prosemirror-model';
import {ModelWithExt as Model} from '../../../json-crdt-extensions';
import {ext} from '../../ModelWithExt';
import * as fixtures from './fixtures';
import {assertCanMergeInto} from './setup';
import {schema} from 'prosemirror-test-builder';

describe('.mergePmNode()', () => {
  describe('can merge into an empty node', () => {
    const assertCanMerge = (doc: Node) => {
      const model = Model.create(ext.prosemirror.new());
      const prosemirror = model.s.toExt();
      prosemirror.mergePmNode(doc);
      prosemirror.node.txt.refresh();
      const view = prosemirror.view();
      // console.log(JSON.stringify(view, null, 2));
      // console.log(JSON.stringify(doc.toJSON(), null, 2));
      // console.log(view);
      expect(Node.fromJSON(schema, view).toJSON()).toEqual(doc.toJSON());
    };

    for (const [name, fixture] of Object.entries(fixtures)) {
      test(name, () => {
        assertCanMerge(fixture);
      });
    }
  });

  describe('can merge from any model to any other', () => {
    for (const [name1, fixture1] of Object.entries(fixtures)) {
      for (const [name2, fixture2] of Object.entries(fixtures)) {
        test(`from ${name1} to ${name2}`, () => {
          assertCanMergeInto(fixture1, fixture2);
        });
      }
    }
  });
});
