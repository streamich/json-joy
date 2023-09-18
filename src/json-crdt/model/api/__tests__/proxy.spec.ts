import {Model} from "../../Model";

test('...', () => {
  const model = Model.withLogicalClock();
  model.api.root({a: 123});
  // console.log(model + '');
  console.log(model.find.val.a.toView() + '');
});
