/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/StrNode-hello-world.ts
 */

import {ts} from '../../json-crdt-patch/clock';
import {StrNode} from '../nodes';

const sid = 123; // Site ID
let time = 0; // "time"

const id = ts(sid, time++);
const str = new StrNode(id);

console.log(str.view());
console.log(str + '');

let content = 'Hell world!';
str.insAt(0, ts(sid, time), content);
time += content.length;
console.log(str + '');

content = 'o,';
str.insAt(4, ts(sid, time), content);
time += content.length;
console.log(str + '');
console.log(str.view());
