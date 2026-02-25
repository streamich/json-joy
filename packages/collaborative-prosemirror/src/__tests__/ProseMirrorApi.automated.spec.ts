import {Node} from 'prosemirror-model';
import {ModelWithExt as Model, ext} from 'json-joy/lib/json-crdt-extensions';
import {FromPm} from '../sync/FromPm';
import {ToPmNode} from '../sync/toPmNode';
import * as fixtures from './fixtures';
import {assertCanMergeInto} from './setup';
import {schema} from 'prosemirror-test-builder';

describe('.mergePmNode()', () => {
  describe('can merge into an empty node', () => {
    const assertCanMerge = (doc: Node) => {
      const toPm = new ToPmNode(schema);
      const model = Model.create(ext.peritext.new(''));
      const api = model.s.toExt();
      api.txt.editor.merge(FromPm.convert(doc));
      api.txt.refresh();
      const view = toPm.convert(api.txt.blocks).toJSON();
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
