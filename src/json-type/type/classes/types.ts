import type {JsonTypeValidator} from '../../codegen/validator/types';

export interface Validators {
  object?: JsonTypeValidator;
  string?: JsonTypeValidator;
  boolean?: JsonTypeValidator;
}
