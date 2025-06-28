/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/docs-val.ts
 */

import {Model} from '..';

// const model = Model.create(void 0, 1234);

// console.log(model + '');
// console.log(model.view());
// console.log(model.toString());

const model = Model.create(void 0, 1234); // 1234 is the session ID
console.log(model + '');

// model.api.root({
//   arr: [42, 69],
// });
// console.log(model + '');

model.api.set([42, 69]);
console.log(model + '');

model.api.val([0]).set(99);
console.log(model + '');
