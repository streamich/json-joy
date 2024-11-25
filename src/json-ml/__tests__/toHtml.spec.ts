import {toHtml} from '../toHtml';
import type {JsonMlNode} from '../types';

test('simple text', () => {
  expect(toHtml('hello')).toBe('hello');
});

test('bold text', () => {
  const ml: JsonMlNode = ['b', null, 'bold'];
  expect(toHtml(ml)).toBe('<b>bold</b>');
});

test('fragment', () => {
  const ml: JsonMlNode = ['', null, ['b', null, 'bold'], ' text'];
  expect(toHtml(ml)).toBe('<b>bold</b> text');
});

test('nested nodes', () => {
  const ml: JsonMlNode = [
    '',
    null,
    ['div', null, ['b', null, 'bold'], ' text'],
    ['p', null, 'Hello world'],
    ['blockquote', null, ['p', null, 'Hello', ' ', ['b', null, ['u', null, 'world']], ['i', null, '!!!']]],
  ];
  expect(toHtml(ml)).toBe(
    '<div><b>bold</b> text</div><p>Hello world</p><blockquote><p>Hello <b><u>world</u></b><i>!!!</i></p></blockquote>',
  );
});

test('can escape text', () => {
  const ml: JsonMlNode = ['', null, ['div', null, ['b', null, 'bold'], ' text >>']];
  expect(toHtml(ml)).toBe('<div><b>bold</b> text &#62;&#62;</div>');
});

test('can render attributes', () => {
  const ml: JsonMlNode = ['', null, ['div', {'data-type': 'very-bold'}, ['b', null, 'bold'], ' text >>']];
  expect(toHtml(ml)).toBe('<div data-type="very-bold"><b>bold</b> text &#62;&#62;</div>');
});

test('can escape attribute values', () => {
  const ml: JsonMlNode = ['span', {class: 'test<a:not("asdf")&test'}, 'text'];
  expect(toHtml(ml)).toBe('<span class="test&lt;a:not(&quot;asdf&quot;)&amp;test">text</span>');
});
