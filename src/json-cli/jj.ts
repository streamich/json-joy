import {createCli} from '../json-type-cli';
import {TypeRouter} from '../json-type/system/TypeRouter';
import {defineCrdtRoutes} from './routes/crdt';
import {definePatchRoutes} from './routes/patch';
import {defineUtilRoutes} from './routes/util';

// prettier-ignore
const router =
  ( definePatchRoutes
  ( defineCrdtRoutes
  ( defineUtilRoutes
  ( TypeRouter.create()))));

const cli = createCli({
  router,
  version: 'v' + require('../../package.json').version,
  cmd: 'jj',
});

cli.run();
