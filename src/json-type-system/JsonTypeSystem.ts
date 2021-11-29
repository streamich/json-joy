import type {TType} from '../json-type/types';
import {BooleanValidator, createBoolValidator, ObjectValidator, createObjValidator} from '../json-type-validator';
import {dynamicFunction} from '../util/codegen/dynamicFunction';
import {JsonEncoderFn, JsonSerializerCodegen} from '../json-type-serializer';

export type Types = {[ref: string]: TType};

const literalTypes: string[] = ['bin', 'bool', 'nil', 'num', 'str'];

export interface JsonTypeSystemOptions<T extends Types> {
  types: T;
}

export class JsonTypeSystem<T extends Types> {
  public constructor(protected readonly options: JsonTypeSystemOptions<T>) {}

  public readonly ref = (ref: string): TType => {
    const type = this.options.types[ref];
    if (!type) throw new Error(`Type [ref = ${ref}] not found.`);
    return type;
  };

  protected readonly fastValidatorCache: {[ref: string]: BooleanValidator} = {};
  protected readonly fastValidatorUsage: {[ref: string]: number} = {};

  public getFastValidator(ref: string) {
    const type = this.ref(ref);
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

  protected readonly fullValidatorCache: {[ref: string]: ObjectValidator} = {};

  public getFullValidator(ref: string) {
    const type = this.ref(ref);
    const cachedFastValidator = this.fastValidatorCache[ref];
    if (cachedFastValidator) return cachedFastValidator;
    const [validator, setValidator] = dynamicFunction<ObjectValidator>(() => {
      throw new Error(`Type [ref = ${ref}] not implemented.`);
    });
    this.fullValidatorCache[ref] = validator;
    setValidator(createObjValidator(type, {
      customValidators: [],
      ref: (id: string) => this.getFastValidator(id),
    }));
    return validator;
  }

  protected readonly jsonSerializerCache: {[ref: string]: JsonEncoderFn} = {};
  protected readonly jsonSerializerUsage: {[ref: string]: number} = {};

  public getJsonSerializer(ref: string): JsonEncoderFn {
    const type = this.ref(ref);
    const jsonSerializerCached = this.jsonSerializerCache[ref];
    if (jsonSerializerCached) {
      this.jsonSerializerUsage[ref] = (this.jsonSerializerUsage[ref] || 0) + 1;
      return jsonSerializerCached;
    }
    const codegen = new JsonSerializerCodegen({
      type,
      ref: (id: string) => {
        const type = this.ref(id);
        if (literalTypes.indexOf(type.__t) !== -1) return type;
        return this.getJsonSerializer(id);
      },
    });
    const [serializer, setSerializer] = dynamicFunction<JsonEncoderFn>(() => {
      throw new Error(`Type [ref = ${ref}] JSON serializer not implemented.`);
    });
    this.jsonSerializerCache[ref] = serializer;
    const realSerializer = codegen.run().compile();
    if (this.jsonSerializerUsage[ref]) setSerializer(realSerializer);
    this.jsonSerializerCache[ref] = realSerializer;
    return realSerializer;
  }
}
