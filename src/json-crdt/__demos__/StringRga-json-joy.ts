/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/StringRga-json-joy.ts
 */

import {ts} from '../../json-crdt-patch/clock';
import {StringRga} from '../types/rga-string/StringRga';

const user1 = 123;
const user2 = 345;
const user3 = 789;

console.log();

// User 1 creates a new string
const str1 = new StringRga(ts(user1, 0));
str1.insAt(0, ts(user1, 1), 'js');

// User 2 and 3 insert their changes at the same time "ts(user1, 2)"
str1.ins(ts(user1, 2), ts(user2, 3), ' joy');
str1.ins(ts(user1, 2), ts(user3, 3), 'on');

console.log(str1 + '');
// StringRga 123.0 { "json joy" }
// └─ StringChunk 789.3!2 len:8 { "on" }
//    ← StringChunk 123.1!2 len:2 { "js" }
//    → StringChunk 345.3!4 len:4 { " joy" }

console.log();

// User 1 creates a new string "js"
const str2 = new StringRga(ts(user1, 0));
str2.insAt(0, ts(user1, 1), 'js');

// User 2 and 3 insert their changes at the same time "ts(user1, 2)"
str2.ins(ts(user1, 2), ts(user3, 3), 'on');
str2.ins(ts(user1, 2), ts(user2, 3), ' joy');

console.log(str2 + '');
// StringRga 123.0 { "json joy" }
// └─ StringChunk 345.3!4 len:8 { " joy" }
//    ← StringChunk 789.3!2 len:4 { "on" }
//      ← StringChunk 123.1!2 len:2 { "js" }
