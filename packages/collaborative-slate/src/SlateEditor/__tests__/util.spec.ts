import {getDocumentOutline} from '../util';
import type {SlateEditorDocument} from '../types';

describe('SlateEditor util', () => {
  test('builds document outline entries from heading nodes in document order', () => {
    const doc: SlateEditorDocument = [
      {type: 'h1', children: [{text: 'Overview'}]},
      {type: 'p', children: [{text: 'Intro paragraph'}]},
      {type: 'h2', children: [{text: ' Getting started '}]},
      {
        type: 'blockquote',
        children: [{text: 'Context that should not show up in the outline'}],
      },
      {type: 'h3', children: [{text: 'API notes'}]},
      {type: 'h2', children: [{text: '   '}]},
    ];
    expect(getDocumentOutline(doc)).toEqual([
      {key: '0', path: [0], type: 'h1', level: 1, title: 'Overview'},
      {key: '2', path: [2], type: 'h2', level: 2, title: 'Getting started'},
      {key: '4', path: [4], type: 'h3', level: 3, title: 'API notes'},
    ]);
  });
});