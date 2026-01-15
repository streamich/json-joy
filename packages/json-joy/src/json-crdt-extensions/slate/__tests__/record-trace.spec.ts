import {SlateTraceRecorder, type SlateTrace} from './tools/traces';

test('record trace', () => {
  const recorder = new SlateTraceRecorder();
  const editor = recorder.editor;
  editor.select(editor.point([0, 0]));
  editor.insertText('Hello, world!');
  editor.select({path: [0, 0], offset: 1});
  editor.insertText('a');
  editor.select({path: [0, 0], offset: 2});
  editor.delete();
  editor.select({path: [0, 0], offset: 6});
  editor.splitNodes();
  editor.select([0]);
  editor.setNodes({indent: 2} as any);
  editor.select({
    anchor: {path: [1, 0], offset: 1},
    focus: {path: [1, 0], offset: 6},
  });
  editor.addMark('bold', true);
  editor.removeMark('bold');
  editor.addMark('bold', true);
  editor.select({
    anchor: {path: [1, 2], offset: 0},
    focus: {path: [1, 2], offset: 1},
  });
  editor.addMark('highlighted', true);
  editor.delete();
  editor.select({
    anchor: {path: [1, 0], offset: 0},
    focus: {path: [1, 0], offset: 1},
  });
  editor.delete();
  editor.select({
    anchor: {path: [0, 0], offset: 1},
    focus: {path: [0, 0], offset: 2},
  });
  editor.addMark('highlighted', true);
  const trace: SlateTrace = recorder.getTrace();
  console.log('TRACE:', JSON.stringify(trace, null, 0));
  console.log(JSON.stringify(editor.children, null, 2));
});
