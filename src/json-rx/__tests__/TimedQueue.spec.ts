import {TimedQueue} from '../TimedQueue';

test('can create queue', () => {
  const queue = new TimedQueue<123>();
});

test('can add items', () => {
  const queue = new TimedQueue<number>();
  queue.onFlush = jest.fn();
  queue.push(123);
  queue.flush();
  expect(queue.onFlush).toHaveBeenCalledWith([123]);
});

test('can flush items', () => {
  const queue = new TimedQueue<number>();
  queue.onFlush = jest.fn();
  queue.push(123);
  queue.push(3);
  queue.flush();
  expect(queue.onFlush).toHaveBeenCalledWith([123, 3]);
  expect(queue.onFlush).toHaveBeenCalledTimes(1);
  queue.push(1);
  queue.push(2);
  queue.push(3);
  queue.flush();
  expect(queue.onFlush).toHaveBeenCalledWith([1, 2, 3]);
  expect(queue.onFlush).toHaveBeenCalledTimes(2);
});

test('flushes queue when item limit is reached, subsequent flush does not execute', () => {
  const queue = new TimedQueue<number>();
  queue.itemLimit = 5;
  queue.onFlush = jest.fn();
  queue.push(0);
  expect(queue.onFlush).toHaveBeenCalledTimes(0);
  queue.push(1);
  expect(queue.onFlush).toHaveBeenCalledTimes(0);
  queue.push(2);
  expect(queue.onFlush).toHaveBeenCalledTimes(0);
  queue.push(3);
  expect(queue.onFlush).toHaveBeenCalledTimes(0);
  queue.push(4);
  expect(queue.onFlush).toHaveBeenCalledTimes(1);
  expect(queue.onFlush).toHaveBeenCalledWith([0, 1, 2, 3, 4]);
  queue.flush();
  expect(queue.onFlush).toHaveBeenCalledTimes(1);
});

test('flushes queue multiple times', () => {
  const queue = new TimedQueue<number>();
  queue.itemLimit = 2;
  queue.onFlush = jest.fn();
  queue.push(0);
  expect(queue.onFlush).toHaveBeenCalledTimes(0);
  queue.push(1);
  expect(queue.onFlush).toHaveBeenCalledTimes(1);
  queue.push(2);
  expect(queue.onFlush).toHaveBeenCalledTimes(1);
  queue.push(3);
  expect(queue.onFlush).toHaveBeenCalledTimes(2);
  expect(queue.onFlush).toHaveBeenCalledWith([0, 1]);
  expect(queue.onFlush).toHaveBeenCalledWith([2, 3]);
  queue.push(4);
  expect(queue.onFlush).toHaveBeenCalledTimes(2);
  queue.flush();
  expect(queue.onFlush).toHaveBeenCalledWith([4]);
});

test('flushes when timeout is reached', (done) => {
  const queue = new TimedQueue<number>();
  queue.timeLimit = 100;
  queue.onFlush = jest.fn();
  queue.push(1);
  queue.push(3);
  queue.push(2);
  expect(queue.onFlush).toHaveBeenCalledTimes(0);
  setTimeout(() => {
    expect(queue.onFlush).toHaveBeenCalledWith([1, 3, 2]);
    expect(queue.onFlush).toHaveBeenCalledTimes(1);
    done();
  }, 101);
});

test('flushes on timeout twice', (done) => {
  const queue = new TimedQueue<number>();
  queue.timeLimit = 20;
  queue.onFlush = jest.fn();
  queue.push(1);
  expect(queue.onFlush).toHaveBeenCalledTimes(0);
  setTimeout(() => {
    expect(queue.onFlush).toHaveBeenCalledWith([1]);
    expect(queue.onFlush).toHaveBeenCalledTimes(1);
    queue.push(2);
    expect(queue.onFlush).toHaveBeenCalledTimes(1);
    setTimeout(() => {
      expect(queue.onFlush).toHaveBeenCalledWith([2]);
      expect(queue.onFlush).toHaveBeenCalledTimes(2);
      done();
    }, 21);
  }, 21);
});

test('does not flush after timeout if queue is empty', (done) => {
  const queue = new TimedQueue<number>();
  queue.timeLimit = 20;
  queue.onFlush = jest.fn();
  queue.push(1);
  expect(queue.onFlush).toHaveBeenCalledTimes(0);
  setTimeout(() => {
    expect(queue.onFlush).toHaveBeenCalledWith([1]);
    expect(queue.onFlush).toHaveBeenCalledTimes(1);
    setTimeout(() => {
      expect(queue.onFlush).toHaveBeenCalledTimes(1);
      done();
    }, 21);
  }, 21);
});

test('when flushed manually, does not flush after timeout', (done) => {
  const queue = new TimedQueue<number>();
  queue.timeLimit = 20;
  queue.onFlush = jest.fn();
  queue.push(1);
  expect(queue.onFlush).toHaveBeenCalledTimes(0);
  setTimeout(() => {
    expect(queue.onFlush).toHaveBeenCalledWith([1]);
    expect(queue.onFlush).toHaveBeenCalledTimes(1);
    queue.push(3);
    queue.flush();
    expect(queue.onFlush).toHaveBeenCalledTimes(2);
    expect(queue.onFlush).toHaveBeenCalledWith([3]);
    setTimeout(() => {
      expect(queue.onFlush).toHaveBeenCalledTimes(2);
      done();
    }, 21);
  }, 21);
});
