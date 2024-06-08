import {ModelWithExt, ext} from '../../../json-crdt-extensions';
import {s} from '../../../json-crdt-patch';
import {PeritextDomUi} from '../../dom/PeritextDomUi';

const div = document.createElement('div');
document.body.appendChild(div);

const model = ModelWithExt.create(s.obj({
  richText: ext.peritext.new('hello world'),
}));

const ui = new PeritextDomUi(model.s.richText.toExt().txt);
ui.render(div);
