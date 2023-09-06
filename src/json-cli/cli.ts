import {Cli} from '../json-type-cli/Cli';
import {TypeRouter} from '../json-type/system/TypeRouter';
import {defineCrdtRoutes} from './routes/crdt';
import {defineUtilRoutes} from './routes/util';

let router = TypeRouter.create();
router = defineUtilRoutes(router);
router = defineCrdtRoutes(router);

const cli = new Cli({router});
cli.run();
