import {operations} from './sample-operations';
import {decode, encode} from '..';

for (const [name, operation] of Object.entries(operations)) {
  // if (name !== 'and2') continue;
  test(name, () => {
    const ops = decode([operation], {});
    const operations = encode(ops);
    expect(operations[0]).toEqual(operation);
  });
}
