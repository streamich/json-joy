/** @jest-environment jsdom */

import {act, fireEvent, render} from '@testing-library/react';
import * as React from 'react';
import {FlexibleInput, type FlexibleInputHandle} from '..';

describe('<FlexibleInput>', () => {
  test('renders an <input> by default', () => {
    const {container} = render(<FlexibleInput value="hello" onChange={() => {}} />);
    const input = container.querySelector('input');
    expect(input).toBeTruthy();
    expect(container.querySelector('textarea')).toBeFalsy();
    expect((input as HTMLInputElement).value).toBe('hello');
  });

  test('renders a <textarea> when multiline', () => {
    const {container} = render(<FlexibleInput multiline value="hello" onChange={() => {}} />);
    expect(container.querySelector('textarea')).toBeTruthy();
    expect(container.querySelector('input')).toBeFalsy();
  });

  test('mirrors the value into the hidden sizer element', () => {
    const {container} = render(<FlexibleInput value="abc" onChange={() => {}} />);
    expect(container.textContent).toContain('abc');
  });

  test('exposes the element through the "inp" ref callback', () => {
    let el: HTMLInputElement | HTMLTextAreaElement | null = null;
    render(<FlexibleInput value="x" onChange={() => {}} inp={(e) => (el = e)} />);
    expect(el).toBeInstanceOf(HTMLInputElement);
  });

  test('calls onChange when the user types', () => {
    const onChange = jest.fn();
    const {container} = render(<FlexibleInput value="a" onChange={onChange} />);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, {target: {value: 'ab'}});
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('exposes an imperative handle with input/resize/focus', () => {
    const ref = React.createRef<FlexibleInputHandle>();
    const {container} = render(<FlexibleInput ref={ref} uncontrolled defaultValue="hi" />);
    expect(ref.current).toBeTruthy();
    expect(ref.current!.input).toBe(container.querySelector('input'));
    expect(typeof ref.current!.resize).toBe('function');
    expect(typeof ref.current!.focus).toBe('function');
  });

  test('uncontrolled: resize() mirrors the live element value into the sizer', () => {
    const ref = React.createRef<FlexibleInputHandle>();
    const {container} = render(<FlexibleInput ref={ref} uncontrolled defaultValue="one" />);
    const input = container.querySelector('input') as HTMLInputElement;
    // Simulate an external (non-React) value change, like a CRDT binding would do.
    act(() => {
      input.value = 'a brand new external value';
      ref.current!.resize();
    });
    expect(container.textContent).toContain('a brand new external value');
  });

  test('focus() focuses the underlying element', () => {
    const ref = React.createRef<FlexibleInputHandle>();
    const {container} = render(<FlexibleInput ref={ref} uncontrolled defaultValue="hi" />);
    const input = container.querySelector('input') as HTMLInputElement;
    act(() => ref.current!.focus());
    expect(document.activeElement).toBe(input);
  });

  test('renders the typebefore prefix', () => {
    const {container} = render(<FlexibleInput value="x" onChange={() => {}} typebefore="$ " />);
    expect(container.textContent).toContain('$');
  });
});
