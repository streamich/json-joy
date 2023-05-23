import {BufferSubject} from '../BufferSubject';

test('can create subject', () => {
  const subject = new BufferSubject(10);
});

test('can subscribe and unsubscribe', () => {
  const subject = new BufferSubject(10);
  const subscription = subject.subscribe();
  subscription.unsubscribe();
});

test('error when buffer overflows', () => {
  const subject = new BufferSubject(2);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(3); // next
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(error.mock.calls[0][0]).toBeInstanceOf(Error);
  expect(error.mock.calls[0][0].message).toMatchInlineSnapshot(`"BUFFER_OVERFLOW"`);
});

test('does not error when buffer was flushed just before overflow', () => {
  const subject = new BufferSubject(2);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  subject.subscribe({next, error, complete}); // subscribe
  subject.next(1); // next
  subject.next(2); // next
  subject.flush();
  subject.next(3); // next
  expect(next).toHaveBeenCalledTimes(3);
  expect(error).toHaveBeenCalledTimes(0);
});

test('subscribe, next', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(next.mock.calls[0][0]).toBe(1);
});

test('next, subscribe', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(next.mock.calls[0][0]).toBe(1);
});

test('subscribe, complete', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.complete(); // complete
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);

  expect(complete.mock.calls[0][0]).toBe(undefined);
});

test('complete, subscribe', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.complete(); // complete
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);

  expect(complete.mock.calls[0][0]).toBe(undefined);
});

test('subscribe, error', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.error('ERROR'); // error
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(error.mock.calls[0][0]).toBe('ERROR');
});

test('error, subscribe', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.error('ERROR'); // error
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(error.mock.calls[0][0]).toBe('ERROR');
});

test('subscribe, next, next, next', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(3); // next
  expect(next).toHaveBeenCalledTimes(3);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(next.mock.calls[2][0]).toBe(3);
});

test('next, subscribe, next, next', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(3); // next
  expect(next).toHaveBeenCalledTimes(3);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(next.mock.calls[2][0]).toBe(3);
});

test('next, next, subscribe, next', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(3); // next
  expect(next).toHaveBeenCalledTimes(3);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(next.mock.calls[2][0]).toBe(3);
});

test('next, next, next, subscribe', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(3); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(3);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(next.mock.calls[2][0]).toBe(3);
});

test('subscribe, next, next, complete', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.complete(); // complete
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(complete.mock.calls[0][0]).toBe(undefined);
});

test('next, subscribe, next, complete', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.complete(); // complete
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(complete.mock.calls[0][0]).toBe(undefined);
});

test('next, next, subscribe, complete', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.complete(); // complete
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(complete.mock.calls[0][0]).toBe(undefined);
});

test('next, next, complete, subscribe', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.complete(); // complete
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(1);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(complete.mock.calls[0][0]).toBe(undefined);
});

test('subscribe, next, next, error', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.error('ERROR'); // complete
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(error.mock.calls[0][0]).toBe('ERROR');
});

test('next, subscribe, next, error', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.error('ERROR'); // complete
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(error.mock.calls[0][0]).toBe('ERROR');
});

test('next, next, subscribe, error', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.error('ERROR'); // complete
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(error.mock.calls[0][0]).toBe('ERROR');
});

test('next, next, error, subscribe', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.error('ERROR'); // complete
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(error.mock.calls[0][0]).toBe('ERROR');
});

test('next, next, error, subscribe, flush', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.error('ERROR'); // complete
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.flush(); // flush
  expect(next).toHaveBeenCalledTimes(2);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(next.mock.calls[0][0]).toBe(1);
  expect(next.mock.calls[1][0]).toBe(2);
  expect(error.mock.calls[0][0]).toBe('ERROR');
});

test('next, next, error, flush, subscribe', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.error('ERROR'); // complete
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.flush(); // flush
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(error.mock.calls[0][0]).toBe('ERROR');
});

test('next, next, flush, error, subscribe', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.flush(); // flush
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.error('ERROR'); // complete
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(error.mock.calls[0][0]).toBe('ERROR');
});

test('next, flush, next, error, subscribe', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.flush(); // flush
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.error('ERROR'); // complete
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(error.mock.calls[0][0]).toBe('ERROR');
});

test('next, flush, next, error, subscribe', () => {
  const subject = new BufferSubject(10);
  const next = jest.fn();
  const error = jest.fn();
  const complete = jest.fn();
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.flush(); // flush
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.error('ERROR'); // complete
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(0);
  expect(complete).toHaveBeenCalledTimes(0);
  subject.subscribe({next, error, complete}); // subscribe
  expect(next).toHaveBeenCalledTimes(0);
  expect(error).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(0);

  expect(error.mock.calls[0][0]).toBe('ERROR');
});

test('subscribe 1, next, next, subscribe 2, flush, next, unsubscribe 2, subscribe 3, next, error, subscribe 4', () => {
  const subject = new BufferSubject(10);
  const next1 = jest.fn();
  const error1 = jest.fn();
  const complete1 = jest.fn();
  const next2 = jest.fn();
  const error2 = jest.fn();
  const complete2 = jest.fn();
  const next3 = jest.fn();
  const error3 = jest.fn();
  const complete3 = jest.fn();
  const next4 = jest.fn();
  const error4 = jest.fn();
  const complete4 = jest.fn();
  expect(next1).toHaveBeenCalledTimes(0);
  expect(error1).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(0);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);
  expect(next3).toHaveBeenCalledTimes(0);
  expect(error3).toHaveBeenCalledTimes(0);
  expect(complete3).toHaveBeenCalledTimes(0);
  expect(next4).toHaveBeenCalledTimes(0);
  expect(error4).toHaveBeenCalledTimes(0);
  expect(complete4).toHaveBeenCalledTimes(0);
  subject.subscribe({next: next1, error: error1, complete: complete1}); // subscribe 1
  expect(next1).toHaveBeenCalledTimes(0);
  expect(error1).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(0);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);
  expect(next3).toHaveBeenCalledTimes(0);
  expect(error3).toHaveBeenCalledTimes(0);
  expect(complete3).toHaveBeenCalledTimes(0);
  expect(next4).toHaveBeenCalledTimes(0);
  expect(error4).toHaveBeenCalledTimes(0);
  expect(complete4).toHaveBeenCalledTimes(0);
  subject.next(1); // next
  expect(next1).toHaveBeenCalledTimes(1);
  expect(error1).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(0);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);
  expect(next3).toHaveBeenCalledTimes(0);
  expect(error3).toHaveBeenCalledTimes(0);
  expect(complete3).toHaveBeenCalledTimes(0);
  expect(next4).toHaveBeenCalledTimes(0);
  expect(error4).toHaveBeenCalledTimes(0);
  expect(complete4).toHaveBeenCalledTimes(0);
  subject.next(2); // next
  expect(next1).toHaveBeenCalledTimes(2);
  expect(error1).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(0);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);
  expect(next3).toHaveBeenCalledTimes(0);
  expect(error3).toHaveBeenCalledTimes(0);
  expect(complete3).toHaveBeenCalledTimes(0);
  expect(next4).toHaveBeenCalledTimes(0);
  expect(error4).toHaveBeenCalledTimes(0);
  expect(complete4).toHaveBeenCalledTimes(0);
  const subscription2 = subject.subscribe({next: next2, error: error2, complete: complete2}); // subscribe 2
  expect(next1).toHaveBeenCalledTimes(2);
  expect(error1).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(2);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);
  expect(next3).toHaveBeenCalledTimes(0);
  expect(error3).toHaveBeenCalledTimes(0);
  expect(complete3).toHaveBeenCalledTimes(0);
  expect(next4).toHaveBeenCalledTimes(0);
  expect(error4).toHaveBeenCalledTimes(0);
  expect(complete4).toHaveBeenCalledTimes(0);
  subject.flush();
  expect(next1).toHaveBeenCalledTimes(2);
  expect(error1).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(2);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);
  expect(next3).toHaveBeenCalledTimes(0);
  expect(error3).toHaveBeenCalledTimes(0);
  expect(complete3).toHaveBeenCalledTimes(0);
  expect(next4).toHaveBeenCalledTimes(0);
  expect(error4).toHaveBeenCalledTimes(0);
  expect(complete4).toHaveBeenCalledTimes(0);
  subject.next(3); // next
  expect(next1).toHaveBeenCalledTimes(3);
  expect(error1).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(3);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);
  expect(next3).toHaveBeenCalledTimes(0);
  expect(error3).toHaveBeenCalledTimes(0);
  expect(complete3).toHaveBeenCalledTimes(0);
  expect(next4).toHaveBeenCalledTimes(0);
  expect(error4).toHaveBeenCalledTimes(0);
  expect(complete4).toHaveBeenCalledTimes(0);
  subscription2.unsubscribe(); // unsubscribe 2
  expect(next1).toHaveBeenCalledTimes(3);
  expect(error1).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(3);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);
  expect(next3).toHaveBeenCalledTimes(0);
  expect(error3).toHaveBeenCalledTimes(0);
  expect(complete3).toHaveBeenCalledTimes(0);
  expect(next4).toHaveBeenCalledTimes(0);
  expect(error4).toHaveBeenCalledTimes(0);
  expect(complete4).toHaveBeenCalledTimes(0);
  subject.subscribe({next: next3, error: error3, complete: complete3}); // subscribe 3
  expect(next1).toHaveBeenCalledTimes(3);
  expect(error1).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(3);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);
  expect(next3).toHaveBeenCalledTimes(0);
  expect(error3).toHaveBeenCalledTimes(0);
  expect(complete3).toHaveBeenCalledTimes(0);
  expect(next4).toHaveBeenCalledTimes(0);
  expect(error4).toHaveBeenCalledTimes(0);
  expect(complete4).toHaveBeenCalledTimes(0);
  subject.next(4); // next
  expect(next1).toHaveBeenCalledTimes(4);
  expect(error1).toHaveBeenCalledTimes(0);
  expect(complete1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(3);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);
  expect(next3).toHaveBeenCalledTimes(1);
  expect(error3).toHaveBeenCalledTimes(0);
  expect(complete3).toHaveBeenCalledTimes(0);
  expect(next4).toHaveBeenCalledTimes(0);
  expect(error4).toHaveBeenCalledTimes(0);
  expect(complete4).toHaveBeenCalledTimes(0);
  subject.error('ERR'); // error
  expect(next1).toHaveBeenCalledTimes(4);
  expect(error1).toHaveBeenCalledTimes(1);
  expect(complete1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(3);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);
  expect(next3).toHaveBeenCalledTimes(1);
  expect(error3).toHaveBeenCalledTimes(1);
  expect(complete3).toHaveBeenCalledTimes(0);
  expect(next4).toHaveBeenCalledTimes(0);
  expect(error4).toHaveBeenCalledTimes(0);
  expect(complete4).toHaveBeenCalledTimes(0);
  subject.subscribe({next: next4, error: error4, complete: complete4}); // subscribe 4
  expect(next1).toHaveBeenCalledTimes(4);
  expect(error1).toHaveBeenCalledTimes(1);
  expect(complete1).toHaveBeenCalledTimes(0);
  expect(next2).toHaveBeenCalledTimes(3);
  expect(error2).toHaveBeenCalledTimes(0);
  expect(complete2).toHaveBeenCalledTimes(0);
  expect(next3).toHaveBeenCalledTimes(1);
  expect(error3).toHaveBeenCalledTimes(1);
  expect(complete3).toHaveBeenCalledTimes(0);
  expect(next4).toHaveBeenCalledTimes(0);
  expect(error4).toHaveBeenCalledTimes(1);
  expect(complete4).toHaveBeenCalledTimes(0);
});
