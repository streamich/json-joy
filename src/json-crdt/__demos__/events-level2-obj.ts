/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/events-level2-obj.ts
 */

// Clear terminal.
console.clear();

// Import all necessary dependencies.
import {Model, konst} from '..';

const main = async () => {
  // Create a new JSON CRDT document.
  const model = Model.withLogicalClock(1234); // 1234 is the session ID

  model.api.set({
    my: {
      deep: {
        obj: {},
      },
    },
  });

  // Print out the document state.
  console.log('Document state #1:');
  console.log(model.root + '');

  model.api.obj(['my', 'deep', 'obj']).events.onChanges.listen(() => {
    console.log(`Called: "onChanges"`);
  });
  model.api.obj(['my', 'deep', 'obj']).events.onViewChanges.listen((view: unknown) => {
    console.log(`Called: "onViewChanges"`);
  });

  // Apply changes to the deep object.
  console.log('Changes which result in view change:');
  console.log('');
  model.api.obj(['my', 'deep', 'obj']).set({foo: 'bar'});
  await new Promise((r) => setTimeout(r, 1));
  console.log('');

  // Print out the document state.
  console.log('Document view #2:');
  console.log(model.root + '');

  // Apply changes, which don't result in view change.
  console.log('Changes which result in only model change:');
  console.log('');
  model.api.obj(['my', 'deep', 'obj']).set({foo: konst('bar')});
  await new Promise((r) => setTimeout(r, 1));
  console.log('');

  // Print out the document state.
  console.log('Document view #3:');
  console.log(model.root + '');
};

main();
