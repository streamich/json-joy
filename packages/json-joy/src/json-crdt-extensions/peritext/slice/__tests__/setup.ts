import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';

export const setup = () => {
  const model = Model.create(void 0, 12345678);
  model.api.set({
    text: '',
    slices: [],
  });
  model.api.str(['text']).ins(0, 'wworld');
  model.api.str(['text']).ins(0, 'helo ');
  model.api.str(['text']).ins(2, 'l');
  model.api.str(['text']).del(7, 1);
  model.api.str(['text']).ins(11, ' this game is awesome');
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  const slices = peritext.savedSlices;
  const encodeAndDecode = () => {
    const buf = model.toBinary();
    const model2 = Model.fromBinary(buf);
    const peritext2 = new Peritext(model2, model2.api.str(['text']).node, model2.api.arr(['slices']).node);
    return {model2, peritext2};
  };
  return {model, peritext, slices, encodeAndDecode};
};
