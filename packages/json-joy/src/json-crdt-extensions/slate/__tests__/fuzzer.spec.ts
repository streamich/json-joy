import {createEditor} from 'slate';
import {SlateFuzzer} from './tools/fuzzer';

test('..', () => {
  const editor = createEditor();
  editor.children = [{type: 'paragraph', children: [{text: 'abc'}]}] as any;
  const fuzzer = new SlateFuzzer(523456789, editor);

  console.log(JSON.stringify(fuzzer.editor.children, null, 2));
  fuzzer.applyRandomHighLevelOperation();
  console.log(JSON.stringify(fuzzer.editor.children, null, 2));
  fuzzer.applyRandomHighLevelOperation();
  console.log(JSON.stringify(fuzzer.editor.children, null, 2));
  fuzzer.applyRandomHighLevelOperation();
  console.log(JSON.stringify(fuzzer.editor.children, null, 2));
  fuzzer.applyRandomHighLevelOperation();
  console.log(JSON.stringify(fuzzer.editor.children, null, 2));
  fuzzer.applyRandomHighLevelOperation();
  console.log(JSON.stringify(fuzzer.editor.children, null, 2));

  // const operation = fuzzer.genAndApplyOperation();
  // console.log(operation);
  // console.log(JSON.stringify(fuzzer.editor.children, null, 2));

  // const operation2 = fuzzer.genAndApplyOperation();
  // console.log(operation2);
  // console.log(JSON.stringify(fuzzer.editor.children, null, 2));

  // const operation3 = fuzzer.genAndApplyOperation();
  // console.log(operation3);
  // console.log(JSON.stringify(fuzzer.editor.children, null, 2));

  // const operation4 = fuzzer.genAndApplyOperation();
  // console.log(operation4);
  // console.log(JSON.stringify(fuzzer.editor.children, null, 2));

  // console.log(JSON.stringify(fuzzer.editor.children, null, 2));
  // fuzzer.editor.apply(operation);

  // console.log(JSON.stringify(doc, null, 2));
  // console.log(JSON.stringify(node, null, 2));
  // console.log(opType);
});
