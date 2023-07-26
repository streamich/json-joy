import {encode, decode} from '../shared';
import {LogicalClock} from '../../../clock';
import {PatchBuilder} from '../../../PatchBuilder';
import {documents} from '../../../../__tests__/json-documents';
import {binaryDocuments} from '../../../../__tests__/binary-documents';
import {SESSION} from '../../../constants';

for (const document of [...documents, ...binaryDocuments]) {
  (document.only ? test.only : test)(document.name, () => {
    const clock = new LogicalClock(SESSION.SERVER, 0);
    const builder = new PatchBuilder(clock);
    const jsonId = builder.json(document.json);
    builder.root(jsonId);
    const encoded = encode(builder.patch);
    const decoded = decode(encoded);
    expect(decoded).toEqual(builder.patch);
  });
}
