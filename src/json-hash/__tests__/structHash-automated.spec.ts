import {documents} from '../../__tests__/json-documents';
import {binaryDocuments} from '../../__tests__/binary-documents';
import {assertStructHash} from './assertStructHash';

describe('computes structural hashes on fixtures', () => {
  for (const {name, json} of [...documents, ...binaryDocuments]) {
    test(name, () => {
      assertStructHash(json);
    });
  }
});
