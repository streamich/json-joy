import {CliParamHelp} from './params/CliParamHelp';
import {CliParamVersion} from './params/CliParamVersion';
import type {CliParam} from './types';

export const defaultParams: CliParam[] = [
  new CliParamVersion(),
  new CliParamHelp(),
];
