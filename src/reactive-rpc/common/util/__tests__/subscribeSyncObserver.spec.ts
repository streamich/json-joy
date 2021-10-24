import {Subject} from 'rxjs';
import {subscribeSyncObserver} from '../subscribeSyncObserver';

test('does not execute callback on initial subscription', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeSyncObserver(subject, {next, error, complete});
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
});

test('receives one emitted value', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeSyncObserver(subject, {next, error, complete});
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1);
  await new Promise((r) => process.nextTick(r));
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith([1], false);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
});

test('receives one emitted value and complete message', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeSyncObserver(subject, {next, error, complete});
  subject.next(1);
  subject.complete();
  await new Promise((r) => process.nextTick(r));
  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith([1], true);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
});

test('can complete immediately', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeSyncObserver(subject, {next, error, complete});
  subject.complete();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
});

test('can emit async multiple times, multiple sync emission per time', async () => {
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  const subject = new Subject();
  subscribeSyncObserver(subject, {next, error, complete});
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
  expect(next).toHaveBeenCalledTimes(3);
  expect(next).toHaveBeenCalledWith([1, 2], false);
  expect(next).toHaveBeenCalledWith([3, 4, 5], false);
  expect(next).toHaveBeenCalledWith([6, 7, 8, 9], true);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);
});
