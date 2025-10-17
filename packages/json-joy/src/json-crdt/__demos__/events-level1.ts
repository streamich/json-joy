/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/events-level1.ts
 */

// Clear terminal.
console.clear();

// Import all necessary dependencies.
import {Model} from '..';
import {type Patch, PatchBuilder} from '../../json-crdt-patch';

const subscribe = (model: Model) => {
  /**
   * Below we attach event listeners to all events that `model.api` supports. The
   * `mode.api` object attaches to `model.on*` events as well as fires its own
   * events as a result of `model.api.*` methods being called. All of that
   * together can be subscribed to through `model.api.on*` event dispatchers.
   */

  // Here we subscribe to "local" events, those are events initiated by calling
  // some `model.api.*` method.
  model.api.onBeforeLocalChange.listen((tick: number) => {
    console.log(`Called: "onBeforeLocalChange", ${tick}`);
  });
  model.api.onLocalChange.listen((tick: number) => {
    console.log(`Called: "onLocalChange", ${tick}`);
  });
  model.api.onLocalChanges.listen((ticks: number[]) => {
    console.log(`Called: "onLocalChanges", ${ticks}`);
  });
  model.api.onFlush.listen((patch: Patch) => {
    console.log(`Called: "onFlush"`);
  });

  // Here we subscribe to "patch" events, those are events triggered by applying
  // a patch to the `model` through `model.applyPatch()` method.
  model.api.onBeforePatch.listen((patch: Patch) => {
    console.log(`Called: "onBeforePatch", ${patch}`);
  });
  model.api.onPatch.listen((patch: Patch) => {
    console.log(`Called: "onPatch", ${patch}`);
  });

  // The "change" events combine all "local" changes with the "patch" changes.
  model.api.onChange.listen((change: number | undefined | Patch) => {
    console.log(`Called: "onChange", ${change}`);
  });
  model.api.onChanges.listen((changes: (number | undefined | Patch)[]) => {
    console.log(`Called: "onChanges", ${changes}`);
  });

  // Transactions is a mechanism which allows a developer to group multiple
  // operations together.
  model.api.onBeforeTransaction.listen(() => {
    console.log(`Called: "onBeforeTransaction"`);
  });
  model.api.onTransaction.listen(() => {
    console.log(`Called: "onTransaction"`);
  });

  // Here we subscribe to "reset" events, which are triggered by
  // calling the `model.reset()` method.
  model.api.onBeforeReset.listen(() => {
    console.log(`Called: "onBeforeReset"`);
  });
  model.api.onReset.listen(() => {
    console.log(`Called: "onReset"`);
  });
};

const main = async () => {
  // Create a new JSON CRDT document.
  const model = Model.create(void 0, 1234); // 1234 is the session ID

  // Clone the model now for future reset.
  const model0 = model.clone();

  // Subscribe to all Level 1 events.
  subscribe(model);

  // Construct a JSON CRDT Patch which sets the document value to `123`.
  const builder = new PatchBuilder(model.clock);
  builder.root(builder.con(123));
  const patch = builder.flush();

  // Print out the document state.
  console.log('Document state #1:');
  console.log(model + '');

  // Apply the patch to the model.
  console.log('Executing: model.applyPatch(patch)');
  console.log('');
  model.applyPatch(patch);
  await new Promise((r) => setTimeout(r, 1));
  console.log('');

  // Print out the document state.
  console.log('Document state #2:');
  console.log(model + '');

  // Reset the model to the initial state.
  console.log('Executing: model.reset(model0)');
  console.log('');
  model.reset(model0);
  await new Promise((r) => setTimeout(r, 1));
  console.log('');

  // Print out the document state.
  console.log('Document state #3:');
  console.log(model + '');

  // Execute a local change.
  console.log('Executing: model.api.root(456)');
  console.log('');
  model.api.set(456);
  await new Promise((r) => setTimeout(r, 1));
  console.log('');

  // Print out the document state.
  console.log('Document state #4:');
  console.log(model + '');

  // Batch multiple operations together using a transaction.
  console.log('Executing: model.api.transaction(() => { ... })');
  console.log('');
  model.api.transaction(() => {
    model.api.set({});
    model.api.obj([]).set({
      a: 'b',
    });
  });
  await new Promise((r) => setTimeout(r, 1));
  console.log('');

  // Print out the document state.
  console.log('Document state #5:');
  console.log(model + '');
};

main();
