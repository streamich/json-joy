import {defaultCodecs} from './defaultCodecs';
import {Cli, type CliOptions} from './Cli';
import type {TypeRouter} from '../json-type/system/TypeRouter';

export const createCli = <Router extends TypeRouter<any>>(options: Partial<CliOptions<Router>>) => {
  const cli = new Cli<Router>({
    codecs: defaultCodecs,
    ...options,
  });
  return cli;
};
