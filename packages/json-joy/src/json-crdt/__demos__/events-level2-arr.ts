/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/events-level2-arr.ts
 */

// Clear terminal.
console.clear();

// Import all necessary dependencies.
import {Model, s} from '..';

const main = async () => {
  // Create a new JSON CRDT document.
  const model = Model.create(void 0, 1234); // 1234 is the session ID

  model.api.set({
    my: {
      deep: {
        arr: [],
      },
    },
  });

  // Print out the document state.
  console.log('Document state #1:');
  console.log(model.root + '');

  model.api.arr(['my', 'deep', 'arr']).events.onChanges.listen(() => {
    console.log(`Called: "onChanges"`);
  });
  model.api.arr(['my', 'deep', 'arr']).events.onViewChanges.listen((view: unknown) => {
    console.log(`Called: "onViewChanges"`);
  });

  // Apply changes to the deep object.
  console.log('Changes which result in view change:');
  console.log('');
  model.api.arr(['my', 'deep', 'arr']).ins(0, [1, 2, 3]);
  await new Promise((r) => setTimeout(r, 1));
  console.log('');

  // Print out the document state.
  console.log('Document view #2:');
  console.log(model.root + '');

  // Apply changes, which don't result in view change.
  console.log('Changes which result in only model change:');
  console.log('');
  model.api.val(['my', 'deep', 'arr', 1]).set(2);
  // model.api.transaction(() => {
  //   model.api.arr(['my', 'deep', 'arr'])
  //     .del(1, 1)
  //     .ins(1, [konst(2)]);
  // });
  await new Promise((r) => setTimeout(r, 1));
  console.log('');

  // Print out the document state.
  console.log('Document view #3:');
  console.log(model.root + '');

  // Apply more changes, which don't result in view change.
  console.log('More changes which result in only model change:');
  console.log('');
  // model.api.transaction(() => {
  const arr = model.api.arr(['my', 'deep', 'arr']);
  arr.del(1, 1);
  arr.ins(1, [s.con(2)]);
  // });
  await new Promise((r) => setTimeout(r, 1));
  console.log('');

  // Print out the document state.
  console.log('Document view #4:');
  console.log(model.root + '');
};

main();
