import {TypeRouter} from '../json-type/system/TypeRouter';
import {Cli} from './Cli';

const router = TypeRouter.create(({t}) => ({
  'util.echo': t.Function(t.any, t.any).implement(async (req) => {
    return req;
  }),
}));

const router2 = router.extend(({t}) => {
  return {
    'util.time': t.Function(t.undef, t.num).implement(async () => Date.now()),
  };
});

const cli = new Cli(router2);

cli.run();
