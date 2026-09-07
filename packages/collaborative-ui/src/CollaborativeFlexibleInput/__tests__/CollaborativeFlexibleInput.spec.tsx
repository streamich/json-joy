/** @jest-environment jsdom */

import type {CollaborativeStr} from '@jsonjoy.com/collaborative-str';
import {act, render} from '@testing-library/react';
import {Model, s} from 'json-joy/lib/json-crdt';
import * as React from 'react';
import {CollaborativeFlexibleInput} from '..';

const setup = (initial = 'John Doe') => {
  const model = Model.create(s.str(initial));
  const str = () => model.s.$ as unknown as CollaborativeStr;
  return {model, str};
};

describe('<CollaborativeFlexibleInput> (composition of CollaborativeInput + FlexibleInput)', () => {
  test('renders an <input> bound to the initial CRDT value', () => {
    const {str} = setup('Hello');
    const {container} = render(<CollaborativeFlexibleInput str={str} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('Hello');
  });

  test('renders a <textarea> when multiline', () => {
    const {str} = setup();
    const {container} = render(<CollaborativeFlexibleInput multiline str={str} />);
    expect(container.querySelector('textarea')).toBeTruthy();
    expect(container.querySelector('input')).toBeFalsy();
  });

  test('mirrors the value into the hidden sizer for auto-sizing', () => {
    const {str} = setup('Measure me');
    const {container} = render(<CollaborativeFlexibleInput str={str} />);
    expect(container.textContent).toContain('Measure me');
  });

  test('a remote/programmatic CRDT change updates the bound element and re-measures', () => {
    const {str} = setup('one');
    const {container} = render(<CollaborativeFlexibleInput str={str} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('one');
    act(() => {
      str().ins(3, ' two');
    });
    expect(input.value).toBe('one two');
    // The sizer mirrors the new value, proving resize() was triggered.
    expect(container.textContent).toContain('one two');
  });

  test('exposes the underlying element through the "inp" ref callback', () => {
    const {str} = setup();
    let el: HTMLInputElement | HTMLTextAreaElement | null = null;
    render(<CollaborativeFlexibleInput str={str} inp={(e) => (el = e)} />);
    expect(el).toBeInstanceOf(HTMLInputElement);
  });

  test('renders without React warnings (e.g. ref spread / controlled-input)', () => {
    const {str} = setup('hi');
    const errors: unknown[][] = [];
    const spy = jest.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args);
    });
    try {
      const {unmount} = render(<CollaborativeFlexibleInput fullWidth str={str} />);
      unmount();
    } finally {
      spy.mockRestore();
    }
    expect(errors).toEqual([]);
  });
});
