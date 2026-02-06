import {JsonCodegen} from '../JsonCodegen';
import {Configuration} from '../../../../__tests__/fixtures';

describe('Generated code inspection', () => {
  test('should show generated encoder code for Configuration', () => {
    const fn = JsonCodegen.get(Configuration);
    
    // Print the function to see what was generated
    console.log('Generated encoder function:');
    console.log(fn.toString());
    
    // The function should exist
    expect(typeof fn).toBe('function');
  });
});
