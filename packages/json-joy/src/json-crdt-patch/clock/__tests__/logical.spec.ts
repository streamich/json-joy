import {ts} from '..';

describe('LogicalTimestamp', () => {
  describe('performance', () => {
    test('has only two fields', () => {
      const stamp = ts(0, 0);
      expect(Object.keys(stamp).length).toBe(2);
    });

    test('does not inherit from other objects', () => {
      const stamp = ts(0, 0);
      expect('' + (stamp as any).__proto__.__proto__).toBe('[object Object]');
    });
  });
});
