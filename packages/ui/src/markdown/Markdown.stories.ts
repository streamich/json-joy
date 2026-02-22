import type {Meta, StoryObj} from '@storybook/react';
import {Markdown as Component} from './Markdown';

const meta: Meta<typeof Component> = {
  title: 'Markdown/<Markdown>',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

export const Primary: StoryObj<typeof meta> = {
  args: {
    src: 'Hello, **world**!',
  },
};

export const Inline: StoryObj<typeof meta> = {
  args: {
    src: `
Paragraph *one*.

Paragraph **two**.
`,
  },
};

export const InlineElements: StoryObj<typeof meta> = {
  args: {
    src: `
- *alpha* --- italic
- __bravo__ --- bold
- ~~hello~~ --- strikethrough
- ==important== --- highlighted
- \`console.log(123)\` --- code
- \`\`js console.log(123)\`\` --- custom language code
- $$2+2$$ --- math
- Superscript^text^
- Subscript~text~
- :smile: --- emoji
`,
  },
};

export const InlineCombinations: StoryObj<typeof meta> = {
  args: {
    src: `
- *hello __world__* --- bold inside italic
- __hello *world*__ --- italic inside bold
- ==hello __world__== --- bold inside highlighted
- ==hello _world_== --- italic inside highlighted
- ==hello _wo**rld**_== --- bold inside italic inside highlighted
`,
  },
};

export const Links: StoryObj<typeof meta> = {
  args: {
    src: `
Inline [link](http://google.com).

Reference [link][google] to [google][]---and shorthand---[google].

[google]: http://google.com
`,
  },
};

export const InlineLink: StoryObj<typeof meta> = {
  args: {
    src: `
Text with https://www.youtube.com/watch?v=AGp4KFLuQNc&feature=youtu.be&t=359 a link.
`,
  },
};

export const Image: StoryObj<typeof meta> = {
  args: {
    src: `
Simple standalone image:

![](https://user-images.githubusercontent.com/9773803/53509104-6fc53000-3abb-11e9-8ad3-71882cb9f8d3.png)

Image with \`alt\` text:

![alt text](https://user-images.githubusercontent.com/9773803/53509104-6fc53000-3abb-11e9-8ad3-71882cb9f8d3.png)

Image with \`title\` text:

![](https://user-images.githubusercontent.com/9773803/53509104-6fc53000-3abb-11e9-8ad3-71882cb9f8d3.png "this is title")

Inline ![](https://user-images.githubusercontent.com/9773803/53509104-6fc53000-3abb-11e9-8ad3-71882cb9f8d3.png) image
`,
  },
};

export const Checklist: StoryObj<typeof meta> = {
  args: {
    src: `
- [ ] Todo
- [x] Done
`,
  },
};

export const TitleWithText: StoryObj<typeof meta> = {
  args: {
    src: `
# Hello

This is text.
`,
  },
};

export const TitleScale: StoryObj<typeof meta> = {
  args: {
    src: `
# Title 1

## Title 2

### Title 3

#### Title 4

##### Title 5

###### Title 6
`,
  },
};

export const MostElements: StoryObj<typeof meta> = {
  args: {
    src: `
# Title

## This is ==Subtitle==

Hello :smile: this is a $$2+2$$ paragraph.${'  '}
This ++should++ be on new line. This is [Google](http://www.google.com "This is Google").
But this is [Bing][bing][^1].

[^1]: First footnote...

[bing]: http://bing.com "Das ist Bing"

----------------

Here are \\ # **\\\`\\\`** escaped characters.

> ... some quote ...

This is \`code\`, and this is \`\`js colored.code('asfd')\`\`:

    git status

This is some JavaScript^1^~2~ ~~code~~:

\`\`\`js
console.log(123);
\`\`\`

![image](https://user-images.githubusercontent.com/9773803/53509104-6fc53000-3abb-11e9-8ad3-71882cb9f8d3.png "Image haha")

\`\`\`
cd
\`\`\`

Image reference:

![image][img]

[img]: https://user-images.githubusercontent.com/9773803/53509104-6fc53000-3abb-11e9-8ad3-71882cb9f8d3.png "Image haha"

https://github.com/streamich
`,
  },
};

export const Footnotes: StoryObj<typeof meta> = {
  args: {
    src: `
Sandwiches are the most healthy food[^healty-food]. It has been documented by NASA.[^NASA]
Burger[^1] is a type of sandwich.

[^1]: Burger footnote.
[^healty-food]: Yes, very healthy.
[^NASA]: Even Marsians eat sandwiches.
`,
  },
};
