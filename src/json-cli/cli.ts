import {Cli} from '../json-type-cli/Cli';
import {TypeRouter} from '../json-type/system/TypeRouter';
import {defineCrdtRoutes} from './routes/crdt';
import {defineUtilRoutes} from './routes/util';

// prettier-ignore
const router =
  ( defineCrdtRoutes
  ( defineUtilRoutes
  ( TypeRouter.create())));

const cli = new Cli({router});
cli.run();
