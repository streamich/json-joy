import {documents} from '../../__tests__/json-documents';
import {stringify} from '..';

for (const {name, json, only} of [...documents]) {
  (only ? test.only : test)(name, () => {
    const cloned = JSON.parse(stringify(json));
    expect(cloned).toStrictEqual(json);
  });
}
