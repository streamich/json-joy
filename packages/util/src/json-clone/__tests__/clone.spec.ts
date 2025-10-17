import {documents} from '../../__tests__/json-documents';
import {clone} from '../clone';

for (const {name, json, only} of [...documents]) {
  (only ? test.only : test)(name, () => {
    const cloned = clone(json);
    if (cloned && typeof cloned === 'object') expect(cloned).not.toBe(json);
    expect(cloned).toStrictEqual(json);
  });
}
