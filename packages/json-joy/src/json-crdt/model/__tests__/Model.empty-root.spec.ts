import {Model, UNDEFINED} from '../Model';

describe('empty root nodes', () => {
  beforeEach(() => {
    (UNDEFINED as any).api = undefined;
    (UNDEFINED as any).parent = undefined;
  });

  test('blank models do not share undefined root node wrappers', () => {
    // If two models share nodes, such as `UNDEFINED`, the UI, which renders
    // the models, might cache the `UNDEFINED` node, but then it does not know
    // **to which model** the cached `UNDEFINED` belongs.
    const model1 = Model.create();
    const model2 = Model.create();
    const node1 = model1.root.node();
    const node2 = model2.root.node();
    expect(node1).not.toBe(node2);
    const api1 = model1.api.wrap(node1);
    const api2 = model2.api.wrap(node2);
    expect(api1).not.toBe(api2);
    expect(api1.api.model).toBe(model1);
    expect(api2.api.model).toBe(model2);
  });
});
