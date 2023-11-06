import {everyType} from './fixtures';

test('generate random JSON values an validate them', () => {
  for (let i = 0; i < 100; i++) {
    const value = everyType.random();
    everyType.validate(value);
    const validator = everyType.compileValidator({errors: 'object'});
    const error = validator(value);
    expect(error).toBe(null);
  }
});
