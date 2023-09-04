import {TypeSystem} from '../json-type/system';
import {TypeRouter} from '../json-type/system/TypeRouter';
import {Cli} from './Cli';

const system = new TypeSystem();
const t = system.t;
const router = new TypeRouter({
  system,
  routes: {
    'util.echo': t.Function(t.any, t.any).implement(async (req) => {
      return req;
    }),
  },
});
const cli = new Cli(router);

cli.run();
