import {s} from '../../../json-crdt-patch';
import {ModelWithExt, ext} from '../../ModelWithExt';

const schema = s.obj({
  nested: s.obj({
    obj: s.obj({
      text: ext.peritext.new('Hello, world\n'),
    }),
  }),
});

test.skip('should not create empty inline texts', () => {
  const model = ModelWithExt.create(schema);
  const api = model.s.nested.obj.text.toExt();
  const txt = api.txt;
  txt.editor.saved.insStack(123, undefined, [txt.rangeAt(0, 5)]);
  txt.refresh();

  // The above creates empty inline text at the beginning of paragraph, that's not expected.
  console.log(txt + '');
});
