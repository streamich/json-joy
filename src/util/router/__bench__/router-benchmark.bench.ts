/* tslint:disable no-console */

import {Router} from '..';

const router = new Router();

const noop = () => {};
router.add('GET /user', noop);
router.add('GET /user/comments', noop);
router.add('GET /user/avatar', noop);
router.add('GET /user/lookup/username/{username}', noop);
router.add('GET /user/lookup/email/{address}', noop);
router.add('GET /event/{id}', noop);
router.add('GET /event/{id}/comments', noop);
router.add('POST /event/{id}/comment', noop);
router.add('GET /map/{location}/events', noop);
router.add('GET /status', noop);
router.add('GET /very/deep/nested/route/hello/there', noop);
router.add('GET /static/{::\n}', noop);

// router.add('GET /posts', noop);
// router.add('GET /posts/search', noop);
// router.add('GET /posts/{post}', noop);
// router.add('PUT /posts/{post}', noop);
// router.add('POST /posts/{post}', noop);
// router.add('DELETE /posts/{post}', noop);
// router.add('POST /posts', noop);
console.log(router + '');

const matcher = router.compile();
console.log(matcher + '');

const operations = 1e6;

console.time('short static');
for (let i = 0; i < operations; i++) {
  matcher('GET /user');
}
console.timeEnd('short static');

console.time('static with same radix');
for (let i = 0; i < operations; i++) {
  matcher('GET /user/comments');
}
console.timeEnd('static with same radix');

console.time('dynamic route');
for (let i = 0; i < operations; i++) {
  matcher('GET /user/lookup/username/john');
}
console.timeEnd('dynamic route');

console.time('mixed static dynamic');
for (let i = 0; i < operations; i++) {
  matcher('GET /event/abcd1234/comments');
}
console.timeEnd('mixed static dynamic');

console.time('long static');
for (let i = 0; i < operations; i++) {
  matcher('GET /very/deep/nested/route/hello/there');
}
console.timeEnd('long static');

console.time('wildcard');
for (let i = 0; i < operations; i++) {
  matcher('GET /static/index.html');
}
console.timeEnd('wildcard');

console.time('all together');
for (let i = 0; i < operations; i++) {
  matcher('GET /user');
  matcher('GET /user/comments');
  matcher('GET /user/lookup/username/john');
  matcher('GET /event/abcd1234/comments');
  matcher('GET /very/deeply/nested/route/hello/there');
  matcher('GET /static/index.html');
}
console.timeEnd('all together');
