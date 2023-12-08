import {defaultCodecs} from './defaultCodecs';
import {Cli, type CliOptions} from './Cli';
import type {ObjectValue} from '../json-type-value/ObjectValue';

export const createCli = <Router extends ObjectValue<any>>(options: Partial<CliOptions<Router>>) => {
  const cli = new Cli<Router>({
    codecs: defaultCodecs,
    ...options,
  });
  return cli;
};
