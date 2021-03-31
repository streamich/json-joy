import {encode} from '../encode';
import {decode} from '../decode';

test('unsigned integers', () => {
  let x1 = 0;
  let x2 = 1;
  for (let i = 0; i < 10000000000000000000;) {
    i = x1 + x2;
    const buf = encode(i);
    const res = decode(buf, 0);
    expect(res[0]).toBe(i);
    [x1, x2] = [x2, i];
  }
});

test('unsigned integers - 2', () => {
  let x = 0;
  for (let i = 0; i < 10000; i++) {
    const buf = encode(x);
    const res = decode(buf, 0);
    expect(res[0]).toBe(x);
    x += Math.round(1000 * Math.random());
  }
});


test('negative integers', () => {
  let x1 = 0;
  let x2 = -1;
  for (let i = 0; i > -1000000000000000000;) {
    i = x1 + x2;
    const buf = encode(i);
    const res = decode(buf, 0);
    expect(res[0]).toBe(i);
    [x1, x2] = [x2, i];
  }
});

test('floats', () => {
  let x = Math.random();
  for (let i = 0; i < 1000; i++) {
    const buf = encode(x);
    const res = decode(buf, 0);
    expect(res[0]).toBe(x);
    x = x * Math.random();
  }
});

test('floats - 2', () => {
  let x = 1.001;
  for (let i = 0; i < 10000; i++) {
    const buf = encode(x);
    const res = decode(buf, 0);
    expect(res[0]).toBe(x);
    x *= 1 + Math.random();
  }
});

test('floats - 3', () => {
  let x = 0.1
  for (let i = 0; i < 10000; i++) {
    const buf = encode(x);
    const res = decode(buf, 0);
    expect(res[0]).toBe(x);
    x += 0.1;
  }
});

test('floats - 4', () => {
  let x = Math.random();
  for (let i = 0; i < 10000; i++) {
    const buf = encode(x);
    const res = decode(buf, 0);
    expect(res[0]).toBe(x);
    x += Math.random();
  }
});
