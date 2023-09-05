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

const router2 = router.extend(({t}) => {
  return {
    'util.time': t.Function(t.undef, t.num).implement(async () => Date.now()),
  };
});

const cli = new Cli(router2);

cli.run();
