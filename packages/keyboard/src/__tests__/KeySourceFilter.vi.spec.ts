import {resolveFilter} from '../util';

const makeEvent = (target: Partial<HTMLElement> | null = null): KeyboardEvent => {
  return {target} as unknown as KeyboardEvent;
};

describe('resolveFilter', () => {
  test('undefined returns undefined', () => {
    expect(resolveFilter(undefined)).toBeUndefined();
  });

  describe('"no-inputs"', () => {
    const fn = resolveFilter('no-inputs')!;

    test('passes events with no target', () => {
      expect(fn(makeEvent(null))).toBe(true);
    });

    test('passes events from a non-input element', () => {
      expect(fn(makeEvent({tagName: 'BUTTON', isContentEditable: false} as HTMLElement))).toBe(true);
    });

    test('blocks INPUT events', () => {
      expect(fn(makeEvent({tagName: 'INPUT'} as HTMLElement))).toBe(false);
    });

    test('blocks TEXTAREA events', () => {
      expect(fn(makeEvent({tagName: 'TEXTAREA'} as HTMLElement))).toBe(false);
    });

    test('blocks SELECT events', () => {
      expect(fn(makeEvent({tagName: 'SELECT'} as HTMLElement))).toBe(false);
    });

    test('blocks contentEditable events', () => {
      expect(fn(makeEvent({tagName: 'DIV', isContentEditable: true} as HTMLElement))).toBe(false);
    });
  });

  describe('"inputs-only"', () => {
    const fn = resolveFilter('inputs')!;

    test('blocks events with no target', () => {
      expect(fn(makeEvent(null))).toBe(false);
    });

    test('blocks events from a non-input element', () => {
      expect(fn(makeEvent({tagName: 'BUTTON', isContentEditable: false} as HTMLElement))).toBe(false);
    });

    test('passes INPUT events', () => {
      expect(fn(makeEvent({tagName: 'INPUT'} as HTMLElement))).toBe(true);
    });

    test('passes TEXTAREA events', () => {
      expect(fn(makeEvent({tagName: 'TEXTAREA'} as HTMLElement))).toBe(true);
    });

    test('passes SELECT events', () => {
      expect(fn(makeEvent({tagName: 'SELECT'} as HTMLElement))).toBe(true);
    });

    test('passes contentEditable events', () => {
      expect(fn(makeEvent({tagName: 'DIV', isContentEditable: true} as HTMLElement))).toBe(true);
    });
  });

  describe('custom function', () => {
    test('passes the function through unchanged', () => {
      const custom = (e: KeyboardEvent) => e.altKey === true;
      expect(resolveFilter(custom)).toBe(custom);
    });
  });
});
