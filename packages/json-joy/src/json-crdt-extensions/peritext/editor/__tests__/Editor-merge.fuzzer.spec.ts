import type {ViewRange} from '../types';
import {ViewRangeGenerator, type ViewRangeGeneratorOpts} from './fuzzing';
import {ModelWithExt, ext} from '../../../ModelWithExt';
import {assertCanMergeInto, assertCanMergeIntoEmptyDocument} from './merge';

test('can merge into empty document', () => {
  for (let i = 0; i < 50; i++) {
    const view = ViewRangeGenerator.generate({
      // text: 'abcdefghijklmnopqrstuvwxyz',
      // text: '012345',
      // formattingCount: 2,
      // markerCount: 2,
    });
    // logTree(view);
    assertCanMergeIntoEmptyDocument(view);
  }
});

describe('can merge in random documents', () => {
  const mergeRandomDocs = (count: number, opts?: Partial<ViewRangeGeneratorOpts>) => {
    const model = ModelWithExt.create(ext.peritext.new(''));
    const views: ViewRange[] = [];
    for (let i = 0; i < count; i++) {
      const view = ViewRangeGenerator.generate(opts);
      views.push(view);
      try {
        assertCanMergeInto(model, view);
      } catch (error) {
        console.log(`VIEWS (${views.length}):`, JSON.stringify(views));
        throw error;
      }
    }
  };

  test('standardized text', () => {
    for (let i = 0; i < 10; i++) {
      mergeRandomDocs(5, {
        text: 'abcdefghijklmnopqrstuvwxyz',
        // text: '012345',
        // formattingCount: 2,
        // markerCount: 2,
      });
    }
  });

  test('random text', () => {
    for (let i = 0; i < 10; i++) {
      mergeRandomDocs(5);
    }
  });
});
