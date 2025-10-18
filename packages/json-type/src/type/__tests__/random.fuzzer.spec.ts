import {ValidatorCodegen} from '../../codegen/validator/ValidatorCodegen';
import {Random} from '../../random';
import {everyType} from './fixtures';

test('generate random JSON values an validate them', () => {
  for (let i = 0; i < 100; i++) {
    const value = Random.gen(everyType);
    const validator = ValidatorCodegen.get({type: everyType, errors: 'object'});
    const error = validator(value);
    expect(error).toBe(null);
  }
});
