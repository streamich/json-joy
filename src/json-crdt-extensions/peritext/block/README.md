# Rich-text document tree structure

Document is composed of a list of block elements. Block elements can be nested.
At some depth there are leaf block elements, which contain inline elements.
There are also voids (embeds, images, etc.) which are block elements without
text content.

## Block elements

Block elements consume full width of the document. They can be nested. Block
elements cannot overlap.

### Block elements with children

Below block elements can contain other block elements:

- List items `"⁍"`
  - Bullet list
  - Ordered list
  - [Todo list](https://developers.notion.com/reference/block#to-do-blocks)
  - Ability to assign a list item to a user
- Blockquote `<blockquote>`, `">"`
  - Caption `<figcaption>`
- Aside `"⁂"`
  - (Support multiple asides for a block?)
- Details `<details>` + `<summary>`
  - aka [Toggle block](https://developers.notion.com/reference/block#toggle-blocks)
- `<section>`
- Header group `<hgroup>`
- Footer `<footer>`
- Table `<table>`
  - Caption `<caption>`
- [Callout](https://developers.notion.com/reference/block#callout-blocks)
- [Bookmark](https://developers.notion.com/reference/block#bookmark-blocks)

### Leaf block elements

Block elements are:

- Paragraph `"⁋"`
- Heading `"#"`
- Code block
- Definition list `<dl>`
- [Table of contents](https://developers.notion.com/reference/block#table-of-contents-blocks)

### Voids

Voids are block elements without text content. Essentially, they are embeds of
external content.

- Line break, `<hr>`, `"====="`
- Void `<object>`

## Inline elements

Inline elements are contained within block elements. They cannot be nested. But
they can overlap. Inline elements can carry data or can mark a range of text
with some mark.

In general, inline elements could be nested, for example, superscript and
subscript text formatting could be nested. But this is not supported by the
Peritext editor.

The most basic inline element is a text node without any annotation:

- Text

### Boolean mark annotations

Many inline mark annotations are boolean, meaning that they are either present
or not. They are:

- Italic `"*"`, `<i>`, `<em>`
- Bold `"__"`
- Code/Verbatim `<code>`, `"``"`
- Highlight `<mark>`, `"=="`
- Underline `"₋"`
- Math `<math>`, `"$$"`
- `<small>`
- Strike-through `<s>`, `"~~"`
- Keyboard key `<kbd>`
- Spoiler (a password or _spoiler_ text that is revealed when clicked on)

### Non-boolean mark annotations

Some inline mark annotations are not boolean, meaning that they can have a
value. For example, any piece of text can be: (1) subscript, (2) superscript,
or (3) plain text.

Non-boolean marks are:

- Subscript and superscript `<sub>` and `<sup>`
- Deletions and insertions `<del>` and `<ins>`
- Alignment left, right, center `<center>`
- Foreground color
- Background color
- Font family

### Inline elements with data

Inline elements are:

- Link `<a>`, `"[]()"`
  - Citation flag `<cite>`
- Footnote `"^"`
- Citation `"@"`
- Annotation `"~"`
- Comment `"⁇"`
- Note `"⁈"`
- Reference `"⁉"`
- Code with language
- Inline quote `<q>`
- Definition `<dfn>`
- Abbreviation `<abbr>`

### Inline voids

Inline voids are:

- Any inline embed
- Meter `<meter>`
