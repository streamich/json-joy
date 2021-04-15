import {RandomJson} from '../RandomJson';

test('generates random JSON', () => {
  const rj = new RandomJson();
  const json = rj.create();
  const str = JSON.stringify(json);
  expect(str.length > 5).toBe(true);
  expect(JSON.parse(str)).toEqual(json);
});