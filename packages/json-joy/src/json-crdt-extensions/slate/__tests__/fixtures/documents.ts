import type {SlateDocument} from '../../types';
import {a, blockquote, em, h1, h2, h3, li, ol, p, strong, txt, ul} from '../tools/builder';

export const paragraph: SlateDocument = [p({}, txt('This is a paragraph.'))];

export const paragraphs: SlateDocument = [
  p({}, txt('This is a paragraph.')),
  p({}, txt('This is another paragraph.')),
  p({}, txt('This is yet another paragraph.')),
];

export const twoBlockquotes: SlateDocument = [
  blockquote({}, p({}, txt('This is a blockquote.'))),
  blockquote({}, p({}, txt('This is another blockquote. Without a paragraph.'))),
];

export const blockquotes: SlateDocument = [
  blockquote({}, p({}, txt('This is a blockquote.'))),
  blockquote({}, p({}, txt('This is another blockquote. Without a paragraph.'))),
  blockquote(
    p({}, txt('Blockquote with two paragraphs.')),
    p({}, txt('This is the second paragraph of the blockquote.')),
  ),
];

export const list: SlateDocument = [ul(li(p({}, txt('Item 1'))), li(p({}, txt('Item 2'))), li(p({}, txt('Item 3'))))];

export const nestedList: SlateDocument = [
  ul(
    li(p({}, txt('Item 1'))),
    li(
      p({}, txt('Item 2')),
      ul(li(p({}, txt('Subitem 2.1'))), li(p({}, txt('Subitem 2.2'))), li(p({}, txt('Subitem 2.3')))),
    ),
    li(p({}, txt('Item 3'))),
  ),
];

export const headings: SlateDocument = [
  h1(txt('Heading 1')),
  p({}, txt('This is a paragraph under heading 1.')),
  h2(txt('Heading 2')),
  p({}, txt('This is a paragraph under heading 2.')),
  h3(txt('Heading 3')),
  p({}, txt('This is a paragraph under heading 3.')),
];

export const realisticDoc: SlateDocument = [
  h1(txt('Main Title')),
  p(
    {},
    txt('This is the '),
    em('introduction'),
    txt(' paragraph. It introduces the document and provides some context.'),
  ),
  blockquote({}, p({}, txt('This is a quote from someone.'))),
  h2(txt('Section 1')),
  p({}, txt('This is the first section.')),
  ul(
    li(p({}, txt('First item in section 1. It has some details.'))),
    li(p({}, txt('Second item in section 1.'))),
    li(p({}, txt('Third item in section 1.'))),
  ),
  h2(txt('Section 2')),
  p({}, txt('This is the second section.')),
  blockquote({}, p({}, txt('This is another quote.'))),
  h3(txt('Subsection 2.1')),
  p({}, txt('This is a subsection under section 2.')),
  ol(
    1,
    li(p({}, txt('First item in subsection 2.1.'))),
    li(p({}, txt('Second item in subsection 2.1.'))),
    li(p({}, txt('Third item in subsection 2.1.'))),
  ),
  h3(txt('Subsection 2.2')),
  p({}, txt('This is another subsection under section 2.')),
  blockquote({}, p({}, txt('This is a quote in subsection 2.2.'))),
  h1(txt('Conclusion')),
  p({}, txt('This is the conclusion paragraph.')),
];

export const inlineStyles: SlateDocument = [
  p(
    {},
    txt('This is a paragraph with '),
    em('emphasized text'),
    txt(', '),
    strong('strong text'),
    txt(', and a link to '),
    a('https://example.com', 'example.com'),
    txt('.'),
  ),
];

export const nestedInlines: SlateDocument = [
  p(
    {},
    txt('This is a paragraph with '),
    {text: 'nested ', em: true},
    {text: 'inline styles', em: true, strong: true},
    txt(' and a link to '),
    {text: 'example.com', a: {href: 'https://example.com'}, strong: true},
    txt('.'),
  ),
];

export const nestedInlinesWithAttributes: SlateDocument = [
  p(
    {},
    txt('This is a paragraph with '),
    {text: 'nested ', em: true},
    {text: 'inline styles', em: true, strong: true},
    txt(' and a link to '),
    {text: 'example.com', a: {href: 'https://example.com'}, strong: true},
    txt('.'),
  ),
];

export const nestedInlinesWithAttributes2: SlateDocument = [
  p(
    {},
    txt('This is a paragraph with '),
    {text: 'nested ', em: true},
    {text: 'inline styles', em: true, strong: true},
    txt(' and a link to '),
    {text: 'example.com', a: {href: 'https://example.com'}, strong: true},
    txt('.'),
  ),
];
