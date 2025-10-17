/**
 * Run with:
 *
 *     npx ts-node src/__demos__/map-demo.ts
 */

import {TemplateJson} from '../structured/TemplateJson';

console.log('=== Map Template Demo ===\n');

// Basic map usage
console.log('1. Basic map with shorthand:');
const basicMap = TemplateJson.gen('map');
console.log(JSON.stringify(basicMap, null, 2));

// Map with custom key tokens and values
console.log('\n2. Map with custom user IDs and profile data:');
const userMap = TemplateJson.gen([
  'map',
  ['list', 'user_', ['pick', '001', '002', '003', '004', '005']],
  [
    'obj',
    [
      ['name', ['str', ['list', ['pick', 'John', 'Jane', 'Bob', 'Alice'], ' ', ['pick', 'Doe', 'Smith', 'Johnson']]]],
      ['age', ['int', 18, 65]],
      ['active', 'bool'],
    ],
  ],
  2,
  4,
]);
console.log(JSON.stringify(userMap, null, 2));

// Map with complex nested structures
console.log('\n3. Map with API endpoints and their configurations:');
const apiMap = TemplateJson.gen([
  'map',
  ['list', 'api/', ['pick', 'users', 'posts', 'comments', 'auth']],
  [
    'obj',
    [
      ['method', ['str', ['pick', 'GET', 'POST', 'PUT', 'DELETE']]],
      ['timeout', ['int', 1000, 5000]],
      ['retries', ['int', 0, 3]],
      ['auth_required', 'bool'],
    ],
  ],
  3,
  3,
]);
console.log(JSON.stringify(apiMap, null, 2));

// Map with guaranteed size
console.log('\n4. Map with exactly 2 entries:');
const fixedMap = TemplateJson.gen(['map', ['pick', 'key1', 'key2', 'key3'], ['or', 'str', 'int', 'bool'], 2, 2]);
console.log(JSON.stringify(fixedMap, null, 2));
