/* tslint:disable no-console */

import {definitions, routes} from './routes';
import {routers} from './routers';

const {Suite} = require('benchmark');
const suite = new Suite();
const noop = () => {};

for (const router of routers) {
  for (const definition of definitions) router.register(definition, noop);
  if (router.finalize) router.finalize();
  // console.log();
  // console.log(`Structure "${router.name}":`);
  // if (router.print) router.print();
  // console.log();
  // console.log(`Test "${router.name}":`);
  for (const [method, path] of routes) {
    const match = router.find(method, path);
    // console.log(router.name, `${method} ${path}`, match);
  }
}

for (const router of routers) {
  const find = router.find;
  suite.add(`${router.name}`, () => {
    find('DELETE', '/api/collections/123/documents/456/revisions/789');
    find('GET', '/users');
    find('GET', '/users/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    find('GET', '/users/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/followers');
    find('GET', '/users/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/followers/yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy');
    find('POST', '/users/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/followers/yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy');
    find('PUT', '/files/user123-movies/2019/01/01/1.mp4');
    find('GET', '/files/user123-movies/2019/01/01/1.mp4');
    find('GET', '/static/some/path/to/file.txt');
    find('GET', '/ping');
    find('GET', '/pong');
    find('GET', '/info');
  });
}

for (const [method, path] of routes) {
  for (const router of routers) {
    suite.add(`${router.name}: ${method} ${path}`, () => {
      router.find(method, path);
    });
  }
}

suite
  .on('cycle', (event: any) => {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', () => {
    console.log('Fastest is ' + suite.filter('fastest').map('name'));
  })
  .run();
