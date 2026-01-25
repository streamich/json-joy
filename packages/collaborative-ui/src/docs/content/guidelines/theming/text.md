Nice UI uses `nano-theme` library for CSS and theming, which is a performant lean
configuration of `nano-css` library.


## Using `nano-theme`

Install compatible version of `nano-theme` library.

```bash
npm install nano-theme
```


### Theming

`nano-theme` comes with two themes, `light` and `dark`. You can use these
themes to style your components. The default (light) theme can be statically
imported from `nano-theme`.

```jsx
import {theme} from 'nano-theme';
```

To style your components with the correct theme use the `useTheme` hook.

```tsx
import {useTheme} from 'nano-theme';

const MyComponent = ({children}) => {
  const theme = useTheme();

  return (
    <div style={{color: theme.g(0)}}>
      {children}
    </div>
  );
};
```


### Creating CSS rules

Emit global CSS declarations

```jsx
import {put} from 'nano-theme';

put('.my-class', {
  color: 'red',
  fontSize: '16px',
});
```

Generate CSS class names automatically out of CSS rules.

```jsx
import {rule} from 'nano-theme';

const className = rule({
  color: 'red',
  fontSize: '16px',
});
```

Create dynamic CSS rules, which change based on props or state.

```jsx
import {drule, useTheme} from 'nano-theme';

const createClassName = drule({
  fontSize: '16px',
});

const MyComponent = ({children}) => {
  const theme = useTheme();
  const className = createClassName({
    color: theme.g(0),
  });

  return (
    <div className={className}>
      {children}
    </div>
  );
};
```
