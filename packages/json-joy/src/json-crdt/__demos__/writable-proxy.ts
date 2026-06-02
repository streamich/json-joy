/* tslint:disable no-console */

/**
 * Demonstrates the writable, view-shaped proxy `.w`, which lets you edit a
 * JSON CRDT document with ordinary object/array assignment while every
 * mutation records a CRDT operation under the hood.
 *
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/writable-proxy.ts
 */

import {Model, type n} from '..';

const model = Model.create(void 0, 1234) as any as Model<
  n.obj<{
    title: n.str;
    fps: n.con<number>;
    clips: n.arr<n.obj<{name: n.str; start: n.con<number>}>>;
  }>
>;

model.api.set({
  title: 'My project',
  fps: 30,
  clips: [
    {name: 'intro', start: 0},
    {name: 'scene-1', start: 120},
  ],
});

console.log('initial:', model.view());

// Read like a plain object: scalars are values, arrays are real arrays.
console.log('title:', model.w.title); // "My project"
console.log('fps:', model.w.fps); // 30
console.log('clips.length:', model.w.clips.length); // 2
console.log(
  'clip names:',
  model.w.clips.map((c) => c.name),
); // ["intro", "scene-1"]

// Write like a plain object/array: each assignment records a CRDT op.
model.w.title = 'My edited project';
model.w.fps = 60;
model.w.clips.push({name: 'outro', start: 240}); // real Array.push
model.w.clips[0].name = 'opening'; // deep element field edit
model.w.clips.at(1)!.start = 130; // .at(i) returns a live, writable proxy

console.log('edited:', model.view());

// `.w` writes are ordinary local changes, so they collaborate: flush the patch
// and ship it to another replica, which converges.
const patch = model.api.flush();
const replica = Model.create(void 0, 5678) as any as typeof model;
replica.api.flush();
replica.applyPatch(patch);

console.log('replica:', replica.view());
console.log('converged:', JSON.stringify(replica.view()) === JSON.stringify(model.view()));
