import {utf8} from '@jsonjoy.com/buffers/lib/strings';
import {gzip, ungzip} from '../gzip';

test('can gzip and ungzip data', async () => {
  const data = utf8`Hello, World!`;
  const compressed = await gzip(data);
  const uncompressed = await ungzip(compressed);
  expect(uncompressed).toEqual(data);
});
