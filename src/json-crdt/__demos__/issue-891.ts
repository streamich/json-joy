/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/issue-891.ts
 *
 * @see issue: https://github.com/streamich/json-joy/issues/891
 */

import {Model} from '..';

const model = Model.create(void 0, 12345);

model.api.root({});
model.api.flush();
const obj = model.api.obj([]);

obj.set({foo: 'bar'});
const patch1 = model.api.flush();
console.log(patch1 + '');
// Patch ..2345.3!5
// ├─ new_str ..2345.3
// ├─ ins_str ..2345.4!3, obj = ..2345.3 { ..2345.3 ← "bar" }
// └─ ins_obj ..2345.7!1, obj = ..2345.1
//    └─ "foo": ..2345.3

obj.set({foo: 'bar'});
const patch2 = model.api.flush();
console.log(patch2 + '');
// Patch ..2345.8!5
// ├─ new_str ..2345.8
// ├─ ins_str ..2345.9!3, obj = ..2345.8 { ..2345.8 ← "bar" }
// └─ ins_obj ..2345.12!1, obj = ..2345.1
//    └─ "foo": ..2345.8

const patch3 = model.api.flush();
console.log(patch3 + '');
// Patch (nil)!0
