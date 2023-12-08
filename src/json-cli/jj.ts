import {createCli} from '../json-type-cli';
import {ObjectValue} from '../json-type-value/ObjectValue';
import {defineCrdtRoutes} from './routes/crdt';
import {definePatchRoutes} from './routes/patch';
import {defineUtilRoutes} from './routes/util';

// prettier-ignore
const router =
  ( definePatchRoutes
  ( defineCrdtRoutes
  ( defineUtilRoutes
  ( ObjectValue.create()))));

const cli = createCli({
  router,
  version: 'v' + require('../../package.json').version,
  cmd: 'jj',
});

cli.run();
