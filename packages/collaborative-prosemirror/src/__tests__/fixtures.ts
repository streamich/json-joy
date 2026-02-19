import {fromJSON} from '../util';
import {Fragment} from 'prosemirror-model';
import {schema} from 'prosemirror-test-builder';
import {doc, blockquote, ul, ol, li, p, h1, h2, h3, em, strong, a} from 'prosemirror-test-builder';

export const fuzzer1 = fromJSON(
  schema,
  {
    type: 'doc',
    content: [
      {
        type: 'ordered_list',
        attrs: {
          order: 1,
        },
        content: [
          {
            type: 'list_item',
            content: [
              {
                type: 'heading',
                attrs: {
                  level: 2,
                },
                content: [
                  {
                    type: 'text',
                    text: 'abc',
                  },
                ],
              },
              {
                type: 'ordered_list',
                attrs: {
                  order: 1,
                },
                content: [
                  {
                    type: 'list_item',
                    content: [
                      {
                        type: 'heading',
                        attrs: {
                          level: 2,
                        },
                        content: [
                          {
                            type: 'text',
                            text: 'abc',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  (nodes) => (nodes ? new (Fragment as any)(nodes) : Fragment.empty),
);

export const paragraph = doc(p('This is a paragraph.'));

export const paragraphs = doc(
  p('This is a paragraph.'),
  p('This is another paragraph.'),
  p('This is yet another paragraph.'),
);

export const twoBlockquotes = doc(
  blockquote(p('This is a blockquote.')),
  blockquote('This is another blockquote. Without a paragraph.'),
);

export const blockquotes = doc(
  blockquote(p('This is a blockquote.')),
  blockquote('This is another blockquote. Without a paragraph.'),
  blockquote(p('Blockquote with two paragraphs.'), p('This is the second paragraph of the blockquote.')),
);

export const list = doc(ul(li(p('Item 1')), li(p('Item 2')), li(p('Item 3'))));

export const nestedList = doc(
  ul(
    li(p('Item 1')),
    li(p('Item 2'), ul(li(p('Subitem 2.1')), li(p('Subitem 2.2')), li(p('Subitem 2.3')))),
    li(p('Item 3')),
  ),
);

export const headings = doc(
  h1('Heading 1'),
  p('This is a paragraph under heading 1.'),
  h2('Heading 2'),
  p('This is a paragraph under heading 2.'),
  h3('Heading 3'),
  p('This is a paragraph under heading 3.'),
);

export const realisticDoc = doc(
  h1('Main Title'),
  p('This is the', em('introduction'), 'paragraph. It introduces the document and provides some context.'),
  blockquote(p('This is a quote from someone.')),
  h2('Section 1'),
  p('This is the first section.'),
  ul(
    li(p('First item in section 1.', ' It has some details.')),
    li(p('Second item in section 1.')),
    li(p('Third item in section 1.')),
  ),
  h2('Section 2'),
  p('This is the second section.'),
  blockquote(p('This is another quote.')),
  h3('Subsection 2.1'),
  p('This is a subsection under section 2.'),
  ol(
    li(p('First item in subsection 2.1.')),
    li(p('Second item in subsection 2.1.')),
    li(p('Third item in subsection 2.1.')),
  ),
  h3('Subsection 2.2'),
  p('This is another subsection under section 2.'),
  blockquote(p('This is a quote in subsection 2.2.')),
  h1('Conclusion'),
  p('This is the conclusion paragraph.'),
);

export const inlineStyles = doc(
  p(
    'This is a paragraph with ',
    em('emphasized text'),
    ', ',
    strong('strong text'),
    ', and a link to ',
    a({href: 'https://example.com'}, 'example.com'),
    '.',
  ),
);

export const nestedInlines = doc(
  p(
    'This is a paragraph with ',
    em('nested ', strong('inline styles')),
    ' and a link to ',
    a({href: 'https://example.com'}, strong('example.com')),
    '.',
  ),
);

export const nestedInlinesWithAttributes = doc(p(a({href: 'https://example.com'}, strong('example.com'))));

export const nestedInlinesWithAttributes2 = doc(p(strong(a({href: 'https://example.com'}, 'example.com'))));

export const nestingOrderOfInlines = doc(p(em(strong('text'))), p(strong(em('text'))));
