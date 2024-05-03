import {peritext} from '..';
import {ModelWithExt} from '../../ModelWithExt';

test('..', () => {
  const model = ModelWithExt.create();
  model.api.root({
    text: peritext.new('Hello, world\n'),
  });

  // console.log('' + model);
});
