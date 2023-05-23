import {Type, t} from '..';
import {validateTestSuite} from './validateTestSuite';

const validate = (type: Type, value: unknown) => {
  type.validate(value);
};

const validateCodegen = (type: Type, value: unknown) => {
  const validator = type.validator('string');
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
