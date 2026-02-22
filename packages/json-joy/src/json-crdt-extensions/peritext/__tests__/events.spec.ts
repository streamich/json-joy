import {s} from '../../../json-crdt-patch';
import {ModelWithExt, ext} from '../../ModelWithExt';

const schema = s.obj({
  nested: s.obj({
    obj: s.obj({
      text: ext.peritext.new('Hello, world\n'),
    }),
  }),
});

test('can subscribe to text changes', () => {
  const model = ModelWithExt.create(schema);
  const api = model.s.nested.obj.text.toExt();
  const triggered: string[] = [];
  model.s.nested.obj.text.$.onSubtreeChange(() => {
    triggered.push('/nested/obj/text');
  });
  model.s.nested.obj.text.toExt().onSubtreeChange(() => {
    triggered.push('/nested/obj/text$ext');
  });
  api.text().ins(12, '!');
  expect(triggered).toEqual(['/nested/obj/text', '/nested/obj/text$ext']);
});

test('can subscribe to annotation changes', () => {
  const model = ModelWithExt.create(schema);
  const api = model.s.nested.obj.text.toExt();
  const txt = api.txt;
  const triggered: string[] = [];
  model.s.nested.obj.text.$.onSubtreeChange(() => {
    triggered.push('/nested/obj/text');
  });
  model.s.nested.obj.text.toExt().onSubtreeChange(() => {
    triggered.push('/nested/obj/text$ext');
  });
  txt.editor.saved.insStack(123, undefined, [txt.rangeAt(0, 5)]);
  expect(triggered).toEqual(['/nested/obj/text', '/nested/obj/text$ext']);
});
