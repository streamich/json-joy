/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/events-rxjs.ts
 */

// Clear terminal.
console.clear();

// Import all necessary dependencies.
import {BehaviorSubject} from 'rxjs';
import {Model} from '..';

const main = async () => {
  // Create a new JSON CRDT document.
  const model = Model.withLogicalClock(1234); // 1234 is the session ID

  const view$ = new BehaviorSubject(model.view());
  const unsubscribe = model.api.onChanges.listen(() => {
    view$.next(model.view());
  });

  view$.subscribe(() => {
    console.log(`view$ emitted: ${view$.getValue()}`);
  });

  // Execute a local change.
  console.log('Executing: model.api.root(456)');
  model.api.set(456);
  await new Promise((r) => setTimeout(r, 1));
};

main();
