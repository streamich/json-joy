/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/events.ts
 */

import {Model} from '..';

const model = Model.withLogicalClock(1234); // 1234 is the session ID

// No events
// model.applyPatch();

// DOM Level 0 events
// model.onchange = () => {
//   console.log('Document changed');
// };

// DOM Level 2 events
// model.api.events.on('change', () => {
//   console.log('Document changed');
// });

// DOM Level 2 node events
const root = model.api.r;
root.events.onViewChanges.listen(() => {
  console.log('Root value changed');
});

model.api.set(123);
