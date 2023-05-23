import {ExactStep, RegexStep, UntilStep} from './steps';

export type Step = ExactStep | UntilStep | RegexStep;
