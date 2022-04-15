import {stringify, parse} from '..';
import {documents} from '../../__tests__/json-documents';
import {binaryDocuments} from '../../__tests__/binary-documents';
import {msgPackDocuments} from '../../__tests__/msgpack-documents';

for (const document of [...documents, ...binaryDocuments, ...msgPackDocuments]) {
  (document.only ? test.only : test)(document.name, () => {
    const encoded = stringify(document.json);
    const decoded = parse(encoded);
    expect(decoded).toStrictEqual(document.json);
  });
}
