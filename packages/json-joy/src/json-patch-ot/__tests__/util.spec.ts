import {replaceIndices} from '../util';
import {isValidIndex} from '@jsonjoy.com/json-pointer';

describe('Utils', () => {
  describe('isIndexValid', () => {
    it('should return true if valid index passed', () => {
      expect(isValidIndex('0')).toBe(true);
      expect(isValidIndex('10')).toBe(true);
      expect(isValidIndex('45')).toBe(true);
    });

    it('should return false if invalid index passed', () => {
      expect(isValidIndex('')).toBe(false);
      expect(isValidIndex('04')).toBe(false);
      expect(isValidIndex('4.5')).toBe(false);
      expect(isValidIndex('/')).toBe(false);
      expect(isValidIndex('wef')).toBe(false);
    });
  });

  describe('replacePathIndices', () => {
    // Use for remove
    it('should adjust array indices in the path', () => {
      expect(replaceIndices('/array/6', '/array/', '3', false)).toBe('/array/5');
      expect(replaceIndices('/array/6/long/path', '/array/', '3', false)).toBe('/array/5/long/path');
      expect(replaceIndices('/array/3/', '/array/', '2', false)).toBe('/array/2/');
    });
    it('should not adjust the path', () => {
      expect(replaceIndices('/array/3', '/array/', '3', false)).toBe('/array/3');
      expect(replaceIndices('/array/3', '/array/', '2', false)).toBe('/array/2');
      expect(replaceIndices('/array/four', '/array/', '2', false)).toBe('/array/four');
      expect(replaceIndices('/array/4', '/array/', 'four', false)).toBe('/array/4');
    });

    // Used for add
    it('should adjust array indices in the path with increment up option passed', () => {
      expect(replaceIndices('/array/6', '/array/', '3', true)).toBe('/array/7');
      expect(replaceIndices('/array/4/', '/array/', '3', true)).toBe('/array/5/');
      expect(replaceIndices('/array/3/long/path', '/array/', '3', true)).toBe('/array/4/long/path');
      expect(replaceIndices('/array/3', '/array/', '3', true)).toBe('/array/4');
    });
    it('should not adjust the path with increment up option passed', () => {
      expect(replaceIndices('/array/2', '/array/', '3', true)).toBe('/array/2');
      expect(replaceIndices('/array/four', '/array/', '3', true)).toBe('/array/four');
      expect(replaceIndices('/array/four/', '/array/', '3', true)).toBe('/array/four/');
    });
  });
});
