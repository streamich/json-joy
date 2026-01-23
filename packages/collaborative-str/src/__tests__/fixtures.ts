import {Model, s} from 'json-joy/lib/json-crdt';
// import {Log} from 'json-joy/lib/json-crdt/log/Log';
// import {decode as decodeCompactPatch} from 'json-joy/lib/json-crdt-patch/codec/compact/decode';

export const model0 = Model.create(s.str('Hello'));

// const patches3 = require('./automerge-paper.json');
// export const model3 = Model.create();
// export const log3 = Log.fromNewModel(model3);
// for (const patchEncoded of patches3) {
//   const patch = decodeCompactPatch(patchEncoded);
//   log3.end.applyPatch(patch);
// }
// log3.end.api.onLocalChange.listen(() => {
//   log3.end.api.flush();
// });
