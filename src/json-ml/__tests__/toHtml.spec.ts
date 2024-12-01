import {toHtml} from '../toHtml';
import type {JsonMlNode} from '../types';

test('simple text', () => {
  expect(toHtml('hello')).toBe('hello');
});

test('bold text', () => {
  const ml: JsonMlNode = ['b', null, 'bold'];
  expect(toHtml(ml)).toBe('<b>bold</b>');
});

test('when no children, renders self closing tag', () => {
  const ml: JsonMlNode = ['hr', null];
  expect(toHtml(ml)).toBe('<hr />');
});

test('can render self closing tag with attributes', () => {
  const ml: JsonMlNode = ['hr', {foo: 'bar'}];
  expect(toHtml(ml)).toBe('<hr foo="bar" />');
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

test('can format HTML with tabbing', () => {
  const ml: JsonMlNode = ['div', null, ['hr', {foo: 'bar'}], ['span', null, 'text']];
  const html = toHtml(ml, '  ');
  // console.log(html);
  expect(html).toBe('<div>\n  <hr foo="bar" />\n  <span>text</span>\n</div>');
});

test('can format HTML fragment with tabbing', () => {
  const ml: JsonMlNode = ['', null, ['hr', {foo: 'bar'}], ['span', null, 'text']];
  const html = toHtml(ml, '  ');
  // console.log(html);
  expect(html).toBe('<hr foo="bar" />\n<span>text</span>');
});

test('can format HTML fragment with tabbing - 2', () => {
  const ml: JsonMlNode = ['div', null, ['', null, ['hr', {foo: 'bar'}], ['span', null, 'text']]];
  const html = toHtml(ml, '    ');
  // console.log(html);
  expect(html).toBe('<div>\n    <hr foo="bar" />\n    <span>text</span>\n</div>');
});
