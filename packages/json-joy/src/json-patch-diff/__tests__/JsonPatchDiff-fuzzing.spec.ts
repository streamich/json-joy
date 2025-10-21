import {assertDiff, randomArray} from './util';
import {RandomJson} from '@jsonjoy.com/json-random';

const iterations = 100;

test('two random arrays of integers', () => {
  for (let i = 0; i < iterations; i++) {
    const src = randomArray();
    const dst = randomArray();
    try {
      assertDiff(src, dst);
    } catch (error) {
      console.error('src', src);
      console.error('dst', dst);
      throw error;
    }
  }
});

test('random JSON documents', () => {
  for (let i = 0; i < iterations; i++) {
    const src = RandomJson.generate();
    const dst = RandomJson.generate();
    try {
      assertDiff(src, dst);
    } catch (error) {
      console.error('src', JSON.stringify(src, null, 2));
      console.error('dst', JSON.stringify(dst, null, 2));
      throw error;
    }
  }
});

test('random JSON documents with small node count', () => {
  for (let i = 0; i < iterations; i++) {
    const src = RandomJson.generate({nodeCount: 5});
    const dst = RandomJson.generate({nodeCount: 5});
    try {
      assertDiff(src, dst);
    } catch (error) {
      console.error('src', JSON.stringify(src, null, 2));
      console.error('dst', JSON.stringify(dst, null, 2));
      throw error;
    }
  }
});

test('random JSON documents with array root', () => {
  for (let i = 0; i < iterations; i++) {
    const src = RandomJson.generate({rootNode: 'array'});
    const dst = RandomJson.generate({rootNode: 'array'});
    try {
      assertDiff(src, dst);
    } catch (error) {
      console.error('src', JSON.stringify(src, null, 2));
      console.error('dst', JSON.stringify(dst, null, 2));
      throw error;
    }
  }
});

test('random JSON documents with object root', () => {
  for (let i = 0; i < iterations; i++) {
    const src = RandomJson.generate({rootNode: 'object'});
    const dst = RandomJson.generate({rootNode: 'object'});
    try {
      assertDiff(src, dst);
    } catch (error) {
      console.error('src', JSON.stringify(src, null, 2));
      console.error('dst', JSON.stringify(dst, null, 2));
      throw error;
    }
  }
});

test('random string generation', () => {
  for (let i = 0; i < iterations; i++) {
    const src = RandomJson.genString(Math.floor(Math.random() * 50));
    const dst = RandomJson.genString(Math.floor(Math.random() * 50));
    try {
      assertDiff(src, dst);
    } catch (error) {
      console.error('src', JSON.stringify(src));
      console.error('dst', JSON.stringify(dst));
      throw error;
    }
  }
});

test('modify same document', () => {
  for (let i = 0; i < iterations; i++) {
    const src = RandomJson.generate({nodeCount: 8});
    // Create a slightly modified version
    const dst = JSON.parse(JSON.stringify(src));

    // Add random modification
    if (typeof dst === 'object' && dst !== null && !Array.isArray(dst)) {
      dst.randomProp = Math.random();
    } else if (Array.isArray(dst) && dst.length > 0) {
      dst[Math.floor(Math.random() * dst.length)] = Math.random();
    }

    try {
      assertDiff(src, dst);
    } catch (error) {
      console.error('src', JSON.stringify(src, null, 2));
      console.error('dst', JSON.stringify(dst, null, 2));
      throw error;
    }
  }
});
