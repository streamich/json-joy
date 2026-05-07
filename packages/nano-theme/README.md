# nano-theme

A light and opinionated distribution of [`nano-css`](https://github.com/streamich/nano-css).
It ships all necessary dynamic tooling for most CSS-in-JS use cases, while in very
lightweight packaging. `nano-theme` also ships predefined light and dark themes.
As well as colorful color palette, predefined breakpoints and global CSS reset.


## Installation

```sh
npm i nano-theme
```


## Usage

First you might want to reset the global CSS.

```ts
import 'nano-theme/lib/global-reset';
```

Now use the `rule` utility to create CSS classes.

```ts
import {rule} from 'nano-theme';

const className = rule({
  color: 'red',
  fontSize: 16,
  '@media screen and (min-width: 768px)': {
    color: 'blue',
  },
});
```

You can use [shorthand "atoms"](https://github.com/streamich/nano-css/blob/master/docs/atoms.md):

```ts
import {rule} from 'nano-theme';

const className = rule({
  col: 'red',
  fz: 16,
  '@media screen and (min-width: 768px)': {
    col: 'blue',
  },
});
```

Create CSS animations.

```ts
import {keyframes} from 'nano-theme';

const animationName = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
});
```

Import various theming helpers.

```ts
import {theme, font, colors, b1, b2, b3, b4} from 'nano-theme';
```


### React Usage

React integration is also provided:

```tsx
import {Provider, GlobalCss, useTheme, useRule, makeRule} from 'nano-theme';
```

The `Provider` components sets the theme for the entire application. And `GlobalCss`
component applies some global CSS, based on the current theme.

```tsx
<Provider theme={'light'}>
  <GlobalCss />
  <MyApp />
<Provider/>
```

The `useTheme` hook returns the current theme.

```tsx
const theme = useTheme();
```

The `useRule` hook and `makeRule` function are used to dynamically create CSS classes at render-time.

`useRule` example:

```jsx
const MyComponent = () => {
  const className = useRule({
    col: 'red',
    fz: 16,
    '@media screen and (min-width: 768px)': {
      col: 'blue',
    },
  });

  return <div className={className}>Hello</div>;
};
```

`makeRule` example:

```jsx
const useClassName = makeRule({
  color: 'red',
  fontSize: 16,
  '@media screen and (min-width: 768px)': {
    color: 'blue',
  },
});

const MyComponent = () => {
  const className = useClassName();
  
  return <div className={className}>Hello</div>;
};
```
