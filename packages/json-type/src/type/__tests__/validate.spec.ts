import type {Type} from '..';
import {ValidatorCodegen} from '../../codegen/validator/ValidatorCodegen';
import {validateTestSuite} from './validateTestSuite';

const validate = (type: Type, value: unknown) => {
  const validator = ValidatorCodegen.get({type, errors: 'object'});
  const result = validator(value);
  if (result) {
    throw new Error((result as any).code);
  }
};

const validateCodegen = (type: Type, value: unknown) => {
  const validator = ValidatorCodegen.get({type, errors: 'string'});
  const err = validator(value);
  if (err) {
    throw new Error(JSON.parse(err as string)[0]);
  }
};

describe('.validate()', () => {
  validateTestSuite(validate);
});

describe('.codegenValidator()', () => {
  validateTestSuite(validateCodegen);
});
