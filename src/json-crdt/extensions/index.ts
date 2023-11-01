import {PatchBuilder} from '../../json-crdt-patch/PatchBuilder';
import {NodeBuilder} from '../../json-crdt-patch/builder/DelayedValueBuilder';
import {konst} from '../../json-crdt-patch/builder/Konst';
import {ITimestampStruct} from '../../json-crdt-patch/clock';

export const ext = (extensionId: number, nodeBuilder: NodeBuilder) =>
  new NodeBuilder((builder: PatchBuilder): ITimestampStruct => {
    // Extension tuple starts with a 3-byte header:
    // - 1 byte for the extension id
    // - 1 byte for the sid of the tuple id, modulo 256
    // - 1 byte for the time of the tuple id, modulo 256
    const buf = new Uint8Array([extensionId, 0, 0]);
    const tupleId = builder.vec();
    buf[1] = tupleId.sid % 256;
    buf[2] = tupleId.time % 256;
    const bufId = builder.constOrJson(konst(buf));
    const valueId = nodeBuilder.build(builder);
    builder.insVec(tupleId, [
      [0, bufId],
      [1, valueId],
    ]);
    return tupleId;
  });
