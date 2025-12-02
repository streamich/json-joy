import {createEditor} from 'slate';
import {clone, type SlateTrace} from './traces';
import type {SlateDocument, SlateOperation} from '../types';

test('record trace', () => {
  const initialValue = [
    {
      type: 'paragraph',
      children: [{text: ''}],
    },
  ];
  const start = clone(initialValue) as SlateDocument;
  const editor = createEditor();
  editor.children = initialValue;

  // for (const op of trace) if (op.type !== 'set_selection') {
  //   Transforms.transform(editor, <any>op)
  // }

  editor.select(editor.point([0, 0]));
  editor.insertText('Hello, world!');
  editor.select({path: [0, 0], offset: 5});
  editor.insertText('a');
  editor.select({path: [0, 0], offset: 7});
  editor.splitNodes();
  editor.select([0]);
  editor.setNodes({indent: 2} as any);
  editor.select({
    anchor: {path: [1, 0], offset: 1},
    focus: {path: [1, 0], offset: 6},
  });
  editor.addMark('bold', true);
  editor.select({
    anchor: {path: [1, 2], offset: 0},
    focus: {path: [1, 2], offset: 1},
  });
  editor.addMark('highlighted', true);
  editor.delete();

  const trace: SlateTrace = {
    start,
    operations: editor.operations as SlateOperation[],
  };
  // console.log('TRACE:', JSON.stringify(trace));
  // console.log(JSON.stringify(editor.children, null, 2));
});
