import type {TType} from '../json-type/types';
import {BooleanValidator, createBoolValidator} from '../json-type-validator';
import {dynamicFunction} from '../util/codegen/dynamicFunction';

export type Types = {[ref: string]: TType};

export interface JsonTypeSystemOptions<T extends Types> {
  types: T;
}

export class JsonTypeSystem<T extends Types> {
  public constructor(protected readonly options: JsonTypeSystemOptions<T>) {}

  protected readonly fastValidatorCache: {[ref: string]: BooleanValidator} = {};
  protected readonly fastValidatorUsage: {[ref: string]: number} = {};

  public getFastValidator(ref: string) {
    const type = this.options.types[ref];
    if (!type) throw new Error(`Type [ref = ${ref}] not found.`);
    const cachedFastValidator = this.fastValidatorCache[ref];
    if (cachedFastValidator) {
      this.fastValidatorUsage[ref] = (this.fastValidatorUsage[ref] || 0) + 1;
      return cachedFastValidator;
    }
    const [validator, setValidator] = dynamicFunction<BooleanValidator>(() => {
      throw new Error(`Type [ref = ${ref}] not implemented.`);
    });
    this.fastValidatorCache[ref] = validator;
    const realValidator = createBoolValidator(type, {
      customValidators: [],
      ref: (id: string) => this.getFastValidator(id),
      skipObjectExtraFieldsCheck: true,
      unsafeMode: true,
    });
    if (this.fastValidatorUsage[ref]) setValidator(realValidator);
    this.fastValidatorCache[ref] = realValidator;
    return realValidator;
  }
}
