import {Model, s} from 'json-joy/lib/json-crdt';
import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {decode as decodeCompactPatch} from 'json-joy/lib/json-crdt-patch/codec/compact/decode';
import {BlogpostSchema} from '../examples/Blogpost/schema';

export const schema0 = s.obj({
  id: s.con<string>(''),
  name: s.str('John Doe'),
  age: s.val(s.con<number>(42)),
  tags: s.arr([s.str('tag1'), s.str('tag2')]),
});
export const model0 = Model.create(schema0);

export const model1 = Model.create(schema0);
export const log1 = Log.fromNewModel(model1);
log1.end.s.$.set({id: s.con('xyz') as any});
log1.end.api.flush();
log1.end.s.age.$.set(35);
log1.end.api.flush();
log1.end.s.tags.$.del(0, 1);
log1.end.api.flush();
log1.end.s.name.$.del(0, 8);
log1.end.s.name.$.ins(0, 'Va Da');
log1.end.api.flush();
log1.end.s.tags[0].$.del(0, 4);
log1.end.s.tags[0].$.ins(0, 'retired');
log1.end.api.flush();
log1.end.api.onLocalChange.listen(() => {
  log1.end.api.flush();
});

export const model2 = Model.create();
export const log2 = Log.fromNewModel(model2);
log2.end.api.autoFlush();
const patches = require('./friendsforever.log.json');
for (const encoded of patches) {
  const patch = decodeCompactPatch(encoded);
  log2.end.applyPatch(patch);
}

const schema3 = s.obj({
  list: s.arr([]),
});
export const model3 = Model.create(schema3);
export const log3 = Log.fromNewModel(model3);
log3.end.api.autoFlush();

export const model4 = Model.create(BlogpostSchema);
export const log4 = Log.fromNewModel(model4);
log4.end.api.autoFlush();
