import {take} from 'rxjs/operators';
import {JsonRxClient} from '../JsonRxClient';
import {JsonRxServerJson as JsonRxServer} from '../JsonRxServerJson';

test('client can talk with server', async () => {
  const ref: {client: null | JsonRxClient} = {client: null};
  const server = new JsonRxServer({
    send: (message) =>
      setTimeout(() => {
        ref.client!.onMessage(JSON.parse(message as any));
      }, 1),
    call: ((method: any, payload: any) => {
      if (method === 'tripple') return Promise.resolve(JSON.stringify(3 * (payload as number)));
      else throw new Error('Unknown method');
    }) as any,
    notify: () => {},
  });
  const client = new JsonRxClient({
    send: (message) =>
      setTimeout(() => {
        server.onMessage(message as any, undefined);
      }, 1),
  });
  ref.client = client;
  const res1 = await client.call('tripple', 3).pipe(take(1)).toPromise();
  const res2 = await client.call('tripple', 2).pipe(take(1)).toPromise();
  expect(res1).toBe(9);
  expect(res2).toBe(6);
});

test('client can talk with server, parallel requests', async () => {
  const ref: {client: null | JsonRxClient} = {client: null};
  const server = new JsonRxServer({
    send: (message) =>
      setTimeout(() => {
        ref.client!.onMessage(JSON.parse(message as any));
      }, 1),
    call: ((method: any, payload: any) => {
      if (method === 'tripple') return Promise.resolve(3 * (payload as number));
      else throw new Error('Unknown method');
    }) as any,
    notify: () => {},
  });
  const client = new JsonRxClient({
    send: (message) =>
      setTimeout(() => {
        server.onMessage(message as any, undefined);
      }, 1),
  });
  ref.client = client;
  const [res1, res2] = await Promise.all([
    client.call('tripple', 3).pipe(take(1)).toPromise(),
    client.call('tripple', 2).pipe(take(1)).toPromise(),
  ]);
  expect(res1).toBe(9);
  expect(res2).toBe(6);
});

test('server returns "too many subscriptions" error on many parallel requests', async () => {
  const ref: {client: null | JsonRxClient} = {client: null};
  const server = new JsonRxServer({
    maxActiveSubscriptions: 4,
    send: (message) =>
      setTimeout(() => {
        ref.client!.onMessage(JSON.parse(message as any));
      }, 1),
    call: ((method: any, payload: any) => {
      if (method === 'tripple') return new Promise((r) => setTimeout(() => r(3 * (payload as number)), 5));
      else throw new Error('Unknown method');
    }) as any,
    notify: () => {},
  });
  const client = new JsonRxClient({
    send: (message) =>
      setTimeout(() => {
        server.onMessage(message as any, undefined);
      }, 1),
  });
  ref.client = client;
  await Promise.all([
    client.call('tripple', 3).pipe(take(1)).toPromise(),
    client.call('tripple', 3).pipe(take(1)).toPromise(),
    client.call('tripple', 3).pipe(take(1)).toPromise(),
    client.call('tripple', 3).pipe(take(1)).toPromise(),
  ]);
  let err: any;
  try {
    await Promise.all([
      client.call('tripple', 3).pipe(take(1)).toPromise(),
      client.call('tripple', 3).pipe(take(1)).toPromise(),
      client.call('tripple', 3).pipe(take(1)).toPromise(),
      client.call('tripple', 3).pipe(take(1)).toPromise(),
      client.call('tripple', 3).pipe(take(1)).toPromise(),
    ]);
  } catch (error) {
    err = error;
  }
  expect(err).toMatchInlineSnapshot(`
    Object {
      "message": "Too many subscriptions.",
    }
  `);
});
