import {Subject} from 'rxjs';
import {subscribeCompleteObserver} from '../subscribeCompleteObserver';

test('does not execute callback on initial subscription', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeCompleteObserver(subject, {next, error, complete});
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
});

test('receives one emitted value', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeCompleteObserver(subject, {next, error, complete});
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1);
  await new Promise((r) => process.nextTick(r));
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
});

test('receives one emitted value and complete message', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeCompleteObserver(subject, {next, error, complete});
  subject.next(1);
  subject.complete();
  await new Promise((r) => process.nextTick(r));
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledWith(1, true);
});

test('receives one emitted value and complete message, when complete is async', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeCompleteObserver(subject, {next, error, complete});
  subject.next(1);
  await new Promise((r) => process.nextTick(r));
  subject.complete();
  await new Promise((r) => process.nextTick(r));
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledWith(undefined, false);
});

test('can complete immediately', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeCompleteObserver(subject, {next, error, complete});
  subject.complete();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
});

test('can complete after async await', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeCompleteObserver(subject, {next, error, complete});
  subject.complete();
  await new Promise((r) => process.nextTick(r));
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
});

test('can emit async multiple times, multiple sync emission per time', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeCompleteObserver(subject, {next, error, complete});
  subject.next(1);
  subject.next(2);
  await new Promise((r) => setTimeout(r, 1));
  subject.next(3);
  subject.next(4);
  subject.next(5);
  await new Promise((r) => setTimeout(r, 1));
  subject.next(6);
  subject.next(7);
  subject.next(8);
  subject.next(9);
  subject.complete();
  await new Promise((r) => setTimeout(r, 1));
  expect(next).toHaveBeenCalledTimes(8);
  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(next.mock.calls[2][0]).toBe(3);
  expect(next.mock.calls[3][0]).toBe(4);
  expect(next.mock.calls[4][0]).toBe(5);
  expect(next.mock.calls[5][0]).toBe(6);
  expect(next.mock.calls[6][0]).toBe(7);
  expect(next.mock.calls[7][0]).toBe(8);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledWith(9, true);
});

test('can emit async multiple times, multiple sync emission per time and complete with no value', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeCompleteObserver(subject, {next, error, complete});
  subject.next(1);
  subject.next(2);
  await new Promise((r) => setTimeout(r, 1));
  subject.next(3);
  subject.next(4);
  subject.next(5);
  await new Promise((r) => setTimeout(r, 1));
  subject.next(6);
  subject.next(7);
  subject.next(8);
  subject.next(9);
  await new Promise((r) => setTimeout(r, 1));
  subject.complete();
  subject.complete();
  await new Promise((r) => setTimeout(r, 1));
  expect(next).toHaveBeenCalledTimes(9);
  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(next.mock.calls[2][0]).toBe(3);
  expect(next.mock.calls[3][0]).toBe(4);
  expect(next.mock.calls[4][0]).toBe(5);
  expect(next.mock.calls[5][0]).toBe(6);
  expect(next.mock.calls[6][0]).toBe(7);
  expect(next.mock.calls[7][0]).toBe(8);
  expect(next.mock.calls[8][0]).toBe(9);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledWith(undefined, false);
});

test('can error in the middle of execution', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeCompleteObserver(subject, {next, error, complete});
  subject.next(1);
  subject.next(2);
  await new Promise((r) => setTimeout(r, 1));
  subject.next(3);
  subject.next(4);
  subject.error('test');
  subject.error('test2');
  subject.complete();
  await new Promise((r) => setTimeout(r, 1));
  expect(next).toHaveBeenCalledTimes(4);
  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(next.mock.calls[2][0]).toBe(3);
  expect(next.mock.calls[3][0]).toBe(4);
  expect(error).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledWith('test');
  expect(complete).toHaveBeenCalledTimes(0);
});
