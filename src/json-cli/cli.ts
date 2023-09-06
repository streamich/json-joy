import {createCli} from '../json-type-cli';
import {TypeRouter} from '../json-type/system/TypeRouter';
import {defineCrdtRoutes} from './routes/crdt';
import {defineUtilRoutes} from './routes/util';

// prettier-ignore
const router =
  ( defineCrdtRoutes
  ( defineUtilRoutes
  ( TypeRouter.create())));

const cli = createCli({
  router,
  version: 'v1.2.3',
});

cli.run();
