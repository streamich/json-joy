import {HlcFactory, HlcFactoryDependencies} from '../HlcFactory';

test('can construct HCL instances', () => {
  const options: HlcFactoryDependencies = {
    now: () => 5,
    node: 0,
  };
  const factory = new HlcFactory(options);

  const hlc1 = factory.create();
  const hlc2 = factory.create();

  expect(hlc1.ts).toBe(5);
  expect(hlc1.seq).toBe(0);
  expect(hlc1.node).toBe(0);

  expect(hlc2.ts).toBe(5);
  expect(hlc2.seq).toBe(0);
  expect(hlc2.node).toBe(0);
});
