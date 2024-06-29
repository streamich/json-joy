import {setupKit} from './setup';

describe('.insAt()', () => {
  test('can insert text', () => {
    const {peritext} = setupKit();
    peritext.insAt(0, 'ac');
    peritext.insAt(1, 'b');
    peritext.refresh();
    expect(peritext.str.view()).toBe('abc');
  });
});
