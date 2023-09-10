import {CliParamBool} from './params/CliParamBool';
import {CliParamCmd} from './params/CliParamCmd';
import {CliParamFile} from './params/CliParamFile';
import {CliParamFormat} from './params/CliParamFormat';
import {CliParamHelp} from './params/CliParamHelp';
import {CliParamJson} from './params/CliParamJson';
import {CliParamNum} from './params/CliParamNum';
import {CliParamPlan} from './params/CliParamPlan';
import {CliParamStdin} from './params/CliParamStdin';
import {CliParamStdout} from './params/CliParamStdout';
import {CliParamStr} from './params/CliParamStr';
import {CliParamUnd} from './params/CliParamUnd';
import {CliParamVersion} from './params/CliParamVersion';
import type {CliParam} from './types';

export const defaultParams: CliParam[] = [
  new CliParamVersion(),
  new CliParamHelp(),
  new CliParamNum(),
  new CliParamStr(),
  new CliParamBool(),
  new CliParamJson(),
  new CliParamUnd(),
  new CliParamFile(),
  new CliParamCmd(),
  new CliParamFormat(),
  new CliParamStdin(),
  new CliParamStdout(),
  new CliParamPlan(),
];
