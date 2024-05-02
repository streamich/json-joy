import {PeritextExt} from '..';
import {ModelWithExt} from '../../ModelWithExt';

test('..', () => {
  const model = ModelWithExt.create();
  model.api.root({
    text: PeritextExt.new('Hello, world\n'),
  });

  console.log('' + model);
});
